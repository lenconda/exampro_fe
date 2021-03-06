import { createPeerConnectionContext } from './connection';
import { User } from '../../interfaces';
import AppIndicator from '../AppIndicator';
import AppUserCard from '../AppUserCard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { lighten, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import clsx from 'clsx';

const senders = [];
const cameraPeerConnection = createPeerConnectionContext('/camera');
const desktopPeerConnection = createPeerConnectionContext('/desktop');
let joined = false;

export type ChannelMode = 'participant' | 'invigilator';
export type ChannelType = 'camera' | 'desktop';

export interface ConnectedChannel {
  id: string;
  room: string;
  user: User;
  mode: ChannelMode;
}

export interface AppRecorderProps {
  room: string;
  profile: User;
  type?: ChannelType;
  mode?: ChannelMode;
  className?: string;
  selectedChannel?: ConnectedChannel;
  onSelectChannel?(channel: ConnectedChannel): void;
}

const useStyles = makeStyles((theme) => {
  return {
    invigilatorContainer: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    channelsCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      overflowY: 'scroll',
    },
    channelItem: {
      userSelect: 'none',
      cursor: 'pointer',
    },
    channelItemSelected: {
      backgroundColor: lighten(theme.palette.primary.main, 0.85),
    },
    videoCard: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    invigilatorVideo: {
      width: '100%',
    },
  };
});

const AppRecorder: React.FC<AppRecorderProps> = React.memo(({
  room,
  profile,
  type = 'camera',
  mode = 'participant',
  className = '',
  selectedChannel,
  onSelectChannel,
}) => {
  const peerConnection = type === 'camera' ? cameraPeerConnection : desktopPeerConnection;
  const classes = useStyles();
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();

  const handleSetMediaStream = useCallback((stream: MediaStream) => {
    setMediaStream(stream);
  }, []);

  const handleSelectChannel = (channel: ConnectedChannel) => {
    peerConnection.callUser(channel.id);
    if (_.isFunction(onSelectChannel)) {
      onSelectChannel(channel);
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const createMediaStream = async () => {
      if (!mediaStream && mounted) {
        let stream;

        if (mode === 'invigilator') {
          stream = new MediaStream();
        } else {
          stream = type === 'camera'
            ? await navigator.mediaDevices.getUserMedia({
              video: {
                width: { min: 640, ideal: 1920 },
                height: { min: 400, ideal: 1080 },
                aspectRatio: { ideal: 1.7777777778 },
              },
              audio: true,
            })
            : (await (navigator.mediaDevices as any).getDisplayMedia());
        }

        stream.getTracks().forEach((track) => {
          senders.push(peerConnection.peerConnection.addTrack(track, stream));
        });

        return stream;
      } else {
        return mediaStream;
      }
    };

    if (mode === 'participant') {
      createMediaStream().then((stream) => {
        if (stream) {
          handleSetMediaStream(stream);
        }
      });
    }
  }, [mounted]);

  useEffect(() => {
    if (mediaStream) {
      if (localVideo.current) {
        localVideo.current.srcObject = mediaStream;
      }
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!joined) {
      peerConnection.joinRoom(room, profile, mode);
      peerConnection.onRemoveUser((socketId) => {
        setConnectedChannels((users) => users.filter((user) => {
          return user !== socketId;
        }));
      });
      peerConnection.onUpdateUserList((channels) => {
        setConnectedChannels(channels.filter((channel) => {
          return channel.mode !== 'invigilator';
        }));
      });
      peerConnection.onAnswerMade((socket) => {
        peerConnection.callUser(socket);
      });
      peerConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));

      if (mode === 'invigilator') {
        peerConnection.onTrack((stream) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = stream;
          }
        });
      }

      peerConnection.onDisconnected(() => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = null;
        }
      });
    }
    return () => {
      joined = true;
    };
  }, []);

  if (type === 'desktop' && mode === 'participant') {
    return null;
  }
  return mode === 'invigilator'
    ? (
      <Grid container={true} spacing={3} className={classes.invigilatorContainer}>
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={4}
          lg={3}
          xl={2}
        >
          <Card classes={{ root: classes.channelsCard }}>
            {
              connectedChannels.length === 0
                ? <AppIndicator type="empty" />
                : connectedChannels.map((channel) => {
                  return (
                    <AppUserCard
                      key={channel.id}
                      user={channel.user}
                      classes={{
                        root: clsx(classes.channelItem, {
                          [classes.channelItemSelected]: _.get(selectedChannel, 'id') === channel.id,
                        }),
                      }}
                      onClick={() => handleSelectChannel(channel)}
                    />
                  );
                })
            }
          </Card>
        </Grid>
        <Grid
          item={true}
          xs={12}
          sm={12}
          md={8}
          lg={9}
          xl={10}
        >
          <Card classes={{ root: classes.videoCard }}>
            <video
              ref={remoteVideo}
              autoPlay={true}
              className={clsx(classes.invigilatorVideo, className)}
            />
          </Card>
        </Grid>
      </Grid>
    )
    : (
      <video
        ref={localVideo}
        autoPlay={true}
        muted={true}
        className={clsx(className)}
      />
    );
}, (prevProps, nextProps) => {
  return _.isEqual(prevProps, nextProps);
});

export default AppRecorder;

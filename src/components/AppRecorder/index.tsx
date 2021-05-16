import { createPeerConnectionContext } from './connection';
import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../interfaces';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core';
import AppIndicator from '../AppIndicator';
import _ from 'lodash';
import AppUserCard from '../AppUserCard';
import clsx from 'clsx';

const senders = [];
const cameraPeerConnection = createPeerConnectionContext('/camera');
const desktopPeerConnection = createPeerConnectionContext('/desktop');

export interface ConnectedChannel {
  id: string;
  room: string;
  user: User;
}

export interface AppRecorderProps {
  room: string;
  profile: User;
  type?: 'camera' | 'desktop';
  mode?: 'participant' | 'invigilator';
  className?: string;
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

const AppRecorder: React.FC<AppRecorderProps> = ({
  room,
  profile,
  type = 'camera',
  mode = 'participant',
  className = '',
  onSelectChannel,
}) => {
  const peerConnection = type === 'camera' ? cameraPeerConnection : desktopPeerConnection;
  const classes = useStyles();
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [mediaStream, setMediaStream] = useState(null);
  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();

  const handleSelectChannel = (channel: ConnectedChannel) => {
    peerConnection.callUser(channel.id);
    if (_.isFunction(onSelectChannel)) {
      onSelectChannel(channel);
    }
  }

  useEffect(() => {
    const createMediaStream = async () => {
      if (!mediaStream) {
        const stream = type === 'camera'
          ? await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 640, ideal: 1920 },
              height: { min: 400, ideal: 1080 },
              aspectRatio: { ideal: 1.7777777778 },
            },
            audio: true,
          })
          : (await (navigator.mediaDevices as any).getDisplayMedia());

        if (localVideo && localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          senders.push(peerConnection.peerConnection.addTrack(track, stream));
        });

        setMediaStream(stream);
      }
    };

    createMediaStream();
}, [mediaStream]);

  useEffect(() => {
    peerConnection.joinRoom(room, profile);
    peerConnection.onRemoveUser((socketId) => setConnectedChannels((users) => users.filter((user) => user !== socketId)));
    peerConnection.onUpdateUserList((users) => {
      setConnectedChannels(users);
    });
    peerConnection.onAnswerMade((socket) => peerConnection.callUser(socket));
    peerConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));
    if (mode === 'invigilator') {
      peerConnection.onTrack((stream) => {
        remoteVideo.current.srcObject = stream;
      });
    }

    peerConnection.onDisconnected(() => {
      remoteVideo.current.srcObject = null;
    });
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
};

export default AppRecorder;

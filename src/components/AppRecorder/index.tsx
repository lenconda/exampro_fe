import { createPeerConnectionContext } from './connection';
import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../interfaces';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core';
import AppIndicator from '../AppIndicator';
import _ from 'lodash';
import AppUserCard from '../AppUserCard';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

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
  onSelectChannel,
}) => {
  const classes = useStyles();
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  // const [startTimer, setStartTimer] = useState(false);
  // const [isFullScreen, setFullScreen] = useState(false);
  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();
  const mainRef = useRef<HTMLElement>();

  const handleSelectChannel = (channel: ConnectedChannel) => {
    peerVideoConnection.callUser(channel.id);
    if (_.isFunction(onSelectChannel)) {
      onSelectChannel(channel);
    }
  }

  useEffect(() => {
    const createMediaStream = async () => {
      if (!userMediaStream) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1920 },
            height: { min: 400, ideal: 1080 },
            aspectRatio: { ideal: 1.7777777778 },
          },
          audio: true,
        });

        if (localVideo && localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          senders.push(peerVideoConnection.peerConnection.addTrack(track, stream));
        });

        setUserMediaStream(stream);
      }
    };

    createMediaStream();
  }, [userMediaStream]);

  useEffect(() => {
    peerVideoConnection.joinRoom(room, profile);
    peerVideoConnection.onRemoveUser((socketId) => setConnectedChannels((users) => users.filter((user) => user !== socketId)));
    peerVideoConnection.onUpdateUserList((users) => {
      console.log(users);
      setConnectedChannels(users);
    });
    peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
    peerVideoConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));
    peerVideoConnection.onTrack((stream) => (remoteVideo.current.srcObject = stream));

    peerVideoConnection.onConnected(() => {
      // setStartTimer(true);
    });
    peerVideoConnection.onDisconnected(() => {
      // setStartTimer(false);
      remoteVideo.current.srcObject = null;
    });
  }, []);

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
              className={classes.invigilatorVideo}
            />
          </Card>
        </Grid>
      </Grid>
    )
    : (
      <video ref={localVideo} autoPlay muted />
    );
};

export default AppRecorder;

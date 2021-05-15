/* eslint-disable no-return-assign */
/* eslint-disable max-nested-callbacks */
import { createPeerConnectionContext } from '../../utils/rtc';
import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

const useStyles = makeStyles((theme) => {
  return {
    participantVideoCard: {
      position: 'relative',
      marginTop: theme.spacing(2),
      maxHeight: 180,
    },
  };
});

export default () => {
  const classes = useStyles();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);

  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();
  const mainRef = useRef();

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
    peerVideoConnection.joinRoom('123');
    peerVideoConnection.onRemoveUser((socketId) => setConnectedUsers((users) => users.filter((user) => user !== socketId)));
    peerVideoConnection.onUpdateUserList((users) => setConnectedUsers(users));
    peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
    peerVideoConnection.onCallRejected((data) => alert(`User: "Socket: ${data.socket}" rejected your call.`));
    peerVideoConnection.onTrack((stream) => {
      remoteVideo.current.srcObject = stream;
    });

    peerVideoConnection.onConnected(() => {
      setStartTimer(true);
    });
    peerVideoConnection.onDisconnected(() => {
      setStartTimer(false);
      remoteVideo.current.srcObject = null;
    });
  }, []);

  async function shareScreen() {
    // @ts-ignore
    const stream = displayMediaStream || (await navigator.mediaDevices.getDisplayMedia());

    await senders.find((sender) => sender.track.kind === 'video').replaceTrack(stream.getTracks()[0]);

    stream.getVideoTracks()[0].addEventListener('ended', () => {
      cancelScreenSharing(stream);
    });

    localVideo.current.srcObject = stream;

    setDisplayMediaStream(stream);
  }

  async function cancelScreenSharing(stream) {
    await senders
      .find((sender) => sender.track.kind === 'video')
      .replaceTrack(userMediaStream.getTracks().find((track) => track.kind === 'video'));

    localVideo.current.srcObject = userMediaStream;
    stream.getTracks().forEach((track) => track.stop());
    setDisplayMediaStream(null);
  }

  async function handleScreenSharing(isScreenShared) {
    if (isScreenShared) {
      await shareScreen();
    } else {
      await cancelScreenSharing(displayMediaStream);
    }
  }

  return (
    <video
      ref={localVideo}
      autoPlay={true}
      muted={true}
      className={classes.participantVideoCard}
    />
  );
};

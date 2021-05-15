/* eslint-disable no-return-assign */
/* eslint-disable max-nested-callbacks */
import PeerConnectionSession, { createPeerConnectionContext } from '../../utils/rtc';
import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const senders = [];

const useStyles = makeStyles((theme) => {
  return {
    videoCard: {
      position: 'relative',
      marginTop: theme.spacing(2),
      maxHeight: 180,
    },
  };
});

export interface VideoRecorderProps {
  roomId: string;
  userEmail: string;
  mode?: 'participant' | 'invigilator';
  type?: 'camera' | 'desktop';
  className?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  roomId,
  className = '',
  mode = 'participant',
  type = 'camera',
  userEmail,
}) => {
  const classes = useStyles();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  const [peerVideoConnection, setPeerVideoConnection] = useState<PeerConnectionSession>(null);

  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();

  useEffect(() => {
    if (userEmail) {
      setPeerVideoConnection(createPeerConnectionContext(userEmail));
    }
  }, []);

  useEffect(() => {
    const createMediaStream = async () => {
      if (!userMediaStream) {
        const stream = type === 'camera' ? await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1920 },
            height: { min: 400, ideal: 1080 },
            aspectRatio: { ideal: 1.7777777778 },
          },
          audio: true,
          // @ts-ignore
        }) : (displayMediaStream || (await navigator.mediaDevices.getDisplayMedia()));

        if (localVideo && localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        if (peerVideoConnection) {
          stream.getTracks().forEach((track) => {
            senders.push(peerVideoConnection.peerConnection.addTrack(track, stream));
          });
        }

        setUserMediaStream(stream);
      }
    };

    createMediaStream();
  }, [userMediaStream, peerVideoConnection]);

  useEffect(() => {
    if (peerVideoConnection) {
      peerVideoConnection.joinRoom(roomId);
      peerVideoConnection.onRemoveUser((socketId) => setConnectedUsers((users) => users.filter((user) => user !== socketId)));
      peerVideoConnection.onUpdateUserList((users) => setConnectedUsers(users));
      peerVideoConnection.onAnswerMade((socket) => peerVideoConnection.callUser(socket));
      peerVideoConnection.onTrack((stream) => {
        remoteVideo.current.srcObject = stream;
      });

      peerVideoConnection.onDisconnected(() => {
        remoteVideo.current.srcObject = null;
      });
    }
  }, [peerVideoConnection]);

  // async function shareScreen() {
  //   // @ts-ignore
  //   const stream = displayMediaStream || (await navigator.mediaDevices.getDisplayMedia());

  //   await senders.find((sender) => sender.track.kind === 'video').replaceTrack(stream.getTracks()[0]);

  //   stream.getVideoTracks()[0].addEventListener('ended', () => {
  //     cancelScreenSharing(stream);
  //   });

  //   localVideo.current.srcObject = stream;

  //   setDisplayMediaStream(stream);
  // }

  // async function cancelScreenSharing(stream) {
  //   await senders
  //     .find((sender) => sender.track.kind === 'video')
  //     .replaceTrack(userMediaStream.getTracks().find((track) => track.kind === 'video'));

  //   localVideo.current.srcObject = userMediaStream;
  //   stream.getTracks().forEach((track) => track.stop());
  //   setDisplayMediaStream(null);
  // }

  // async function handleScreenSharing(isScreenShared) {
  //   if (isScreenShared) {
  //     await shareScreen();
  //   } else {
  //     await cancelScreenSharing(displayMediaStream);
  //   }
  // }

  return (
    <video
      ref={mode === 'participant' ? localVideo : remoteVideo}
      autoPlay={true}
      muted={true}
      className={clsx(classes.videoCard, className)}
    />
  );
};

export default VideoRecorder;

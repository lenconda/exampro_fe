/* eslint-disable no-return-assign */
/* eslint-disable max-nested-callbacks */
import PeerConnectionSession, { createPeerConnectionContext } from './rtc';
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
    disappear: {
      display: 'none',
    },
  };
});

export interface VideoRecorderProps {
  roomId: string;
  userEmail: string;
  mode?: 'participant' | 'invigilator';
  type?: 'camera' | 'desktop';
  participantEmail?: string;
  className?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  roomId,
  className = '',
  mode = 'participant',
  type = 'camera',
  participantEmail = '',
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
    console.log(111);
    if (userEmail) {
      console.log(222);
      setPeerVideoConnection(createPeerConnectionContext(userEmail));
    }
  }, []);

  useEffect(() => {
    console.log(333);
    (async () => {
      console.log(444);
      if (!userMediaStream && peerVideoConnection) {
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

        stream.getTracks().forEach((track) => {
          senders.push(peerVideoConnection.peerConnection.addTrack(track, stream));
        });

        setUserMediaStream(stream);
      }
    })();
  }, [peerVideoConnection]);

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

  useEffect(() => {
    if (mode === 'invigilator' && participantEmail && userEmail) {
      peerVideoConnection.callUser(participantEmail);
    }
  }, []);

  return (
    <video
      ref={mode === 'participant' ? localVideo : remoteVideo}
      autoPlay={true}
      muted={true}
      className={clsx(classes.videoCard, className, {
        [classes.disappear]: mode === 'participant' && type === 'desktop',
      })}
    />
  );
};

export default VideoRecorder;

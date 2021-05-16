import { createPeerConnectionContext } from './connection';
import { OrganismsHeader, OrganismsMain } from './organisms';
import { MoleculesLocalVideo, MoleculesRemoteVideo, MoleculesVideoControls } from './molecules';
import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../interfaces';

const senders = [];
const peerVideoConnection = createPeerConnectionContext();

export interface AppRecorderProps {
  room: string;
  profile: User;
}

export interface ConnectedUser {
  id: string;
  room: string;
  user: User;
}

const Room: React.FC<AppRecorderProps> = ({
  room,
  profile,
}) => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [displayMediaStream, setDisplayMediaStream] = useState(null);
  // const [startTimer, setStartTimer] = useState(false);
  // const [isFullScreen, setFullScreen] = useState(false);

  const localVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();
  const mainRef = useRef<HTMLElement>();

  useEffect(() => {}, []);

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
    peerVideoConnection.onRemoveUser((socketId) => setConnectedUsers((users) => users.filter((user) => user !== socketId)));
    peerVideoConnection.onUpdateUserList((users) => {
      console.log(users);
      setConnectedUsers(users);
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

  async function shareScreen() {
    const stream = displayMediaStream || (await (navigator.mediaDevices as any).getDisplayMedia());

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

  // function fullScreen() {
  //   setFullScreen(true);
  //   const elem = mainRef.current;
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen();
  //   } else if (elem.msRequestFullscreen) {
  //     elem.msRequestFullscreen();
  //   } else if (elem.mozRequestFullScreen) {
  //     elem.mozRequestFullScreen();
  //   } else if (elem.webkitRequestFullscreen) {
  //     elem.webkitRequestFullscreen();
  //   }
  // }

  // function cancelFullScreen() {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen();
  //   } else if (document.mozCancelFullScreen) {
  //     document.mozCancelFullScreen();
  //   } else if (document.webkitExitFullscreen) {
  //     document.webkitExitFullscreen();
  //   } else if (document.msExitFullscreen) {
  //     document.msExitFullscreen();
  //   }
  // }

  // function handleFullScreen(isFullScreen) {
  //   setFullScreen(isFullScreen);
  //   if (isFullScreen) {
  //     fullScreen();
  //   } else {
  //     cancelFullScreen();
  //   }
  // }

  // async function handleScreenSharing(isScreenShared) {
  //   if (isScreenShared) {
  //     await shareScreen();
  //   } else {
  //     await cancelScreenSharing(displayMediaStream);
  //   }
  // }

  return (
    <div>
      <OrganismsHeader
        onNavItemSelect={(user) => peerVideoConnection.callUser(user.id)}
        navItems={connectedUsers}
        title="WebRTC Example"
        // picture={logo}
      />
      <OrganismsMain ref={mainRef}>
        <MoleculesRemoteVideo ref={remoteVideo} autoPlay />
        <MoleculesLocalVideo ref={localVideo} autoPlay muted />
        {/* <MoleculesVideoControls
          isScreenSharing={Boolean(displayMediaStream)}
          onScreenShare={handleScreenSharing}
          isFullScreen={isFullScreen}
          onFullScreen={handleFullScreen}
          isTimerStarted={startTimer}
        /> */}
      </OrganismsMain>
    </div>
  );
};

export default Room;

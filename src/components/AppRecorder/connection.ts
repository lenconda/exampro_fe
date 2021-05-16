import io, { Socket } from 'socket.io-client';

const { RTCPeerConnection, RTCSessionDescription } = window;

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default class PeerConnectionSession {
  _onConnected: Function;
  _onDisconnected: Function;
  _room: string;
  isAlreadyCalling: boolean = false;
  getCalled: boolean = false;
  socket: Socket;
  peerConnection: RTCPeerConnection;

  constructor(socket, peerConnection) {
    this.socket = socket;
    this.peerConnection = peerConnection;

    this.peerConnection.addEventListener('connectionstatechange', (event) => {
      console.log(this.peerConnection.connectionState);
      const fn = this['_on' + capitalizeFirstLetter(this.peerConnection.connectionState)];
      fn && fn(event);
    });
    this.onCallMade();
  }

  async callUser(to) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    this.socket.emit('call-user', { offer, to });
  }

  onConnected(callback) {
    this._onConnected = callback;
  }

  onDisconnected(callback) {
    this._onDisconnected = callback;
  }

  joinRoom(room, email) {
    this._room = room;
    this.socket.emit('joinRoom', { room, email });
  }

  onCallMade() {
    this.socket.on('call-made', async (data) => {
      // if (this.getCalled) {
      //   const confirmed = window.confirm(`User "Socket: ${data.socket}" wants to call you. Do accept this call?`);

      //   if (!confirmed) {
      //     this.socket.emit('reject-call', {
      //       from: data.socket,
      //     });

      //     return;
      //   }
      // }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      this.socket.emit('make-answer', {
        answer,
        to: data.socket,
      });
      this.getCalled = true;
    });
  }

  onRemoveUser(callback) {
    this.socket.on(`${this._room}-remove-user`, ({ socketId }) => {
      callback(socketId);
    });
  }

  onUpdateUserList(callback) {
    this.socket.on(`${this._room}-update-user-list`, ({ users }) => {
      callback(users);
    });
  }

  onAnswerMade(callback) {
    this.socket.on('answer-made', async (data) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

      if (!this.isAlreadyCalling) {
        callback(data.socket);
        this.isAlreadyCalling = true;
      }
    });
  }

  onCallRejected(callback) {
    this.socket.on('call-rejected', (data) => {
      callback(data);
    });
  }

  onTrack(callback) {
    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      callback(stream);
    };
  }
}

export const createPeerConnectionContext = () => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const socket = io('http://localhost:3000/video');

  return new PeerConnectionSession(socket, peerConnection);
};

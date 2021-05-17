import io, { Socket } from 'socket.io-client';
import { ChannelMode, ConnectedChannel } from '.';
import { User } from '../../interfaces';

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
      const fn = this['_on' + capitalizeFirstLetter(this.peerConnection.connectionState)];
      fn && fn(event);
    });
    this.onCallMade();
  }

  async callUser(to: string) {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    this.socket.emit('call-user', { offer, to });
  }

  onConnected(callback: Function) {
    this._onConnected = callback;
  }

  onDisconnected(callback: Function) {
    this._onDisconnected = callback;
  }

  joinRoom(room: string, user: User, mode: ChannelMode) {
    this._room = room;
    this.socket.emit('join-room', { room, user, mode });
  }

  onCallMade() {
    this.socket.on('call-made', async (data) => {
      console.log('call-made');
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

  onUpdateUserList(callback: (channels: ConnectedChannel[]) => void) {
    this.socket.on(`${this._room}-update-user-list`, ({ users }) => {
      callback(users as ConnectedChannel[]);
    });
  }

  onAnswerMade(callback) {
    this.socket.on('answer-made', async (data) => {
      console.log('answer-made');
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

export const createPeerConnectionContext = (path: string) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const socket = io(path);

  return new PeerConnectionSession(socket, peerConnection);
};

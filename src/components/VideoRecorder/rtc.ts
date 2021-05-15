import _ from 'lodash';
import io, { Socket } from 'socket.io-client';

const { RTCPeerConnection, RTCSessionDescription } = window;

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default class PeerConnectionSession {
  public isAlreadyCalling = false;
  public getCalled = false;
  public peerConnection: RTCPeerConnection;
  public socket: Socket;

  _onConnected;
  _onDisconnected;
  _room;

  private email: string;

  constructor(socket: Socket, peerConnection: RTCPeerConnection, email: string) {
    this.socket = socket;
    this.peerConnection = peerConnection;

    this.peerConnection.addEventListener('connectionstatechange', (event) => {
      const fn = this['_on' + capitalizeFirstLetter(this.peerConnection.connectionState)];
      fn && fn(event);
    });
    this.email = email;
    this.onCallMade();
  }

  // to：要调取的用户
  // email：自己
  async callUser(to) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    this.socket.emit('call-user', { offer, to, email: this.email });
  }

  onConnected(callback) {
    this._onConnected = callback;
  }

  onDisconnected(callback) {
    this._onDisconnected = callback;
  }

  joinRoom(room) {
    this._room = room;
    this.socket.emit('join-room', { room, email: this.email });
  }

  onCallMade() {
    this.socket.on('call-made', async (data) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));

      this.socket.emit('make-answer', {
        answer,
        to: data.socket,
        email: this.email,
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

  onAnswerMadeCallback(callback: Function) {
    this.socket.on('answer-made', async () => {
      if (_.isFunction(callback)) {
        callback();
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

export const createPeerConnectionContext = (email: string) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const socketURL = 'http://localhost:3000/video';
  const socket = io(socketURL);

  return new PeerConnectionSession(socket, peerConnection, email);
};

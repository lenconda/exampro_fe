import styled from 'styled-components';
import { AtomsVideo } from '../atoms';

export const MoleculesRemoteVideo = styled(AtomsVideo)`
  background: black;
  width: 100%;
  height: 100%;
  background: black;

  @media screen and (max-width: 936px) {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
    height: auto;
    border: none;
  }
`;

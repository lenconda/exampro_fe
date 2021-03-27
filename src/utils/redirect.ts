import { Location } from 'history';
import { Base64 } from 'js-base64';

export const encodeRedirectPathname = (location: Location) => {
  const {
    pathname,
    search,
    hash,
  } = location;

  return Base64.encode(`${pathname}${search}${hash}`);
};

export const decodeRedirectPathnameToString = (encodedPathname: string) => {
  return Base64.decode(encodedPathname);
};

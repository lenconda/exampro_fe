import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

export interface ImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  icon?: string;
}

const BROKEN_IMAGE_URL = '/assets/images/broken.svg';

const useStyles = makeStyles((theme) => {
  return {
    none: {
      display: 'none',
    },
    loading: {
      display: 'none',
    },
  };
});

const Image: React.FC<ImageProps> = ({
  icon = '',
  ...props
}) => {
  const classes = useStyles();
  const ref = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (icon && _.isString(icon)) {
      setSrc(`https://unpkg.zhimg.com/@mdi/svg@5.9.55/svg/${_.snakeCase(icon).replace(/_/g, '-')}.svg`);
    } else if (props.src && _.isString(props.src)) {
      setSrc(props.src);
    } else {
      setSrc(BROKEN_IMAGE_URL);
    }
  }, [icon, props]);

  useEffect(() => {
    if (error) {
      setSrc(BROKEN_IMAGE_URL);
    }
  }, [error]);

  return (
    <img
      {...props}
      ref={ref}
      className={clsx({
        [classes.none]: error || src === BROKEN_IMAGE_URL,
        [classes.loading]: loading,
      }, props.className)}
      src={src}
      onError={() => {
        setError(true);
        setLoading(false);
      }}
      onLoadStart={() => setLoading(true)}
      onLoad={(event) => {
        setLoading(false);
        setError(false);
      }}
    />
  );
};

export default Image;

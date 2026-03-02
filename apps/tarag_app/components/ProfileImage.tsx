import {Image} from 'react-native';
import { BACKEND_URL } from '@/constants/Config';

interface ProfileImageProps {
  imagePath?: string;
}

export default function ProfileImage({ imagePath }: ProfileImageProps) {
  const imageSource = imagePath
    ? { uri: `${BACKEND_URL}${imagePath}` }
    : require('@/assets/images/defaultProfile.png');

  return (
    <Image
      source={imageSource}
      style={{ flex: 1, width: '100%', height: '100%' }}
    />
  );
}

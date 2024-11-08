import { UploadsHandler, useFileLoader } from '../lib/useFileLoader';
import { Dropzone } from './Dropzone';

interface UploadDocumentsProps {
  name: string;
  multiple?: boolean;
  canDelete?: boolean;
  uploadHandler: UploadsHandler;
}

export const UploadDocuments = ({
  name,
  multiple = false,
  canDelete = false,
  uploadHandler,
}: UploadDocumentsProps) => {
  const { onAddFiles, onRemove, files, filesUploadProgress } = useFileLoader({
    name,
    uploadHandler,
  });

  const onDrop = (acceptedFiles: File[]) => {
    onAddFiles(acceptedFiles);
  };

  return (
    <Dropzone
      multiple={multiple}
      name={name}
      canDelete={canDelete}
      onRemove={onRemove}
      onDrop={onDrop}
      files={files}
      filesUploadProgress={filesUploadProgress}
    />
  );
};

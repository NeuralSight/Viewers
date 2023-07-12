import React, { useEffect, useState, useRef, ChangeEvent } from 'react';

import { useTranslation } from 'react-i18next';

import { Typography, Button, ButtonEnums, Input, Label } from '@ohif/ui';
import { isFileTypeOkay } from '../utils/isFileOkay';
import {
  ServerResultFormat,
  OrthancServerErrorData,
  OrthancServerSuccessData,
  StudyInfoType,
  Details,
  AnyObject,
  PostImageType,
} from '../../data';
import { getStudyInfoFromImageId } from '../utils/api';
import { readZipFiles } from '../utils/readZipFiles';

const openStudy = StudyInstanceUID => {
  const NEURALSIGHT_CUSTOM_VIEWER_PATH = '/neural-viewer?StudyInstanceUIDs=';
  if (StudyInstanceUID && window) {
    const urlInfo = window.location.href.split('/');
    const baseUrl = urlInfo[0];
    const url = baseUrl + NEURALSIGHT_CUSTOM_VIEWER_PATH;
    window.open(
      `${url}${StudyInstanceUID}` //StudyInstanceUID
    ); //FIXME: If NOT OKAY CHANGE ,,, CURRENT BEHAVIOUR opens every new uploaded dicom image in a seperate tab
  } else {
    console.error(
      'Either studyInstanceUID was not found or window object is undefined'
    );
  }
};

const FILE_TYPE_OPTIONS = [
  {
    value: 'jpg',
    label: 'jpg',
  },
  {
    value: 'png',
    label: 'png',
  },

  // add option for checking dicom files
  // {
  //   value: 'dicom',
  //   label: '',
  // },
];

const DEFAULT_FILENAME = 'image';

const REFRESH_VIEWPORT_TIMEOUT = 100;

type Props = {
  activeViewportElement?: Element;
  onClose: any;
  updateViewportPreview?: any;
  enableViewport?: any;
  disableViewport?: any;
  loadImage?: any;
  uploadImage: any;
  defaultSize?: number;
  minimumSize?: number;
  maximumSize?: number;
  canvasClass?: string;
};

const UploadImageForm = ({
  onClose,
  uploadImage,
  defaultSize,
}: Props): React.ReactNode => {
  const { t } = useTranslation('Modals');

  // inputs
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [patientID, setPatientID] = useState<string>('');

  const [preview, setPreview] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  interface BooleanObject extends AnyObject {
    [key: string]: boolean;
  }

  //  update this file errors increase
  type ErrorTypes =
    | 'filename'
    | 'filesize'
    | 'format'
    | 'server'
    | 'zip'
    | 'detail';

  const IntialErrorState = {
    filename: false,
    filesize: false,
    format: false,
    server: false,
    detail: false,
  };
  const [error, setError] = useState<BooleanObject>(IntialErrorState);
  const [serverError, setServerError] = useState<
    OrthancServerErrorData | Details[]
  >();
  const [success, setSuccess] = useState<OrthancServerSuccessData>();
  const [studyInfo, setStudyInfo] = useState<StudyInfoType>();

  const hasError = Object.values(error).includes(true);

  // const refreshViewport = useRef(null);

  // parameters will go here
  const upload = async () => {
    setServerError(undefined);
    setSuccess(undefined);
    setIsLoading(true);
    try {
      const patientImageData: PostImageType = {
        patientID,
        file: selectedFile,
      };
      console.log('patientImageData', patientImageData);
      const response = await uploadImage(patientImageData);

      const data = await response.json();
      console.log('Data', data.error);
      if (data.error) {
        // setError(initState => ({
        //   ...initState,
        //   server: true,
        // }));
        // setServerError({
        //   Details: data.error,
        //   HttpError: 'Orthanc Error',
        //   HttpStatus: 111,
        //   Message: 'Server is experienceing some problem',
        //   Method: 'Post',
        //   OrthancError: '',
        //   OrthancStatus: 111,
        //   Uri: '',
        // });

        throw new Error(`Error - ${data.error}`);
      }
      if (response.status === 200 || response.status === 201) {
        let successData;
        if (isFileTypeOkay(selectedFile?.name, ['zip'])) {
          successData = data as ServerResultFormat[];
        } else {
          successData = data as ServerResultFormat;
        }
        try {
          let id = '';
          if (successData) {
            if (!Array.isArray(successData)) {
              const newSuccessData = successData as ServerResultFormat;
              id = newSuccessData.predicted_details.ParentStudy; // user predicted parent study optionaly user uploaded in other case however here interested with the predicted values
              setSuccess(newSuccessData.predicted_details);
            } else {
              const newSuccessData = successData as ServerResultFormat[];
              const successArr = newSuccessData.filter(
                data =>
                  data.predicted_details.Status.toLocaleLowerCase() == 'success'
              );

              //TODO: If multiple files check if it single or mulitple of now gets the last item
              if (successArr.length > 0) {
                setSuccess(successArr[successArr.length - 1].predicted_details);
                id = successArr[successArr.length - 1].predicted_details.Path;
              } else {
                console.log(
                  'Success data',
                  newSuccessData[newSuccessData.length - 1].predicted_details
                );
                setSuccess(
                  newSuccessData[newSuccessData.length - 1].predicted_details
                );
                id =
                  newSuccessData[newSuccessData.length - 1].predicted_details
                    .Path;
              }
            }
          }

          const response = await getStudyInfoFromImageId(id);
          const studyInfo = (await response.json()) as StudyInfoType;
          console.log('StudyInfo', studyInfo);
          console.log('ParentStudy', id);
          setStudyInfo(studyInfo);

          // check for window object first
          if (!window) {
            console.error(
              'Error-> window must be used avoid ssr for now',
              window
            );
          }

          openStudy(studyInfo.MainDicomTags?.StudyInstanceUID);
          // redirect to
        } catch (error) {
          console.error('Error ->', error);
        }
        // }
      } else if (response.status === 422) {
        const errorData = data?.detail as Details[];
        setServerError(errorData);
        setError(initState => ({
          ...initState,
          detail: true,
        }));
        // console.log('error', error);
        errorData.map((error: Details, index: number) => {
          throw new Error(
            index +
              '). ' +
              'Error Type: ' +
              error.type +
              ', Error Message:' +
              error.msg
          );
        });
      } else {
        const errorData = data as OrthancServerErrorData;
        console.log('errorData', errorData);
        setServerError(errorData);
        setError(initState => ({
          ...initState,
          server: true,
        }));
        console.log('error', error);
        throw new Error(
          'Error Code: ' +
            errorData.HttpStatus +
            ', Error Message:' +
            errorData.Message +
            ',Error Details:' +
            errorData.Details +
            ',Orthanc Status:' +
            errorData.OrthancStatus +
            ',Orthanc Message:' +
            errorData.OrthancError +
            ',Method:' +
            errorData.Method
        );
      }
    } catch (error) {
      if (error) {
        console.error(error);
      } else {
        console.error('Oops server could not connect check your network');
      }
    }
    //after finishing loading
    setIsLoading(false);
  };

  const error_messages = {
    filename: 'No file selected.',
    filesize: 'size cannot exceed 10mbs.',
    format: 'format allowed are JPG, PNG, ZIP, DICOM only!',
    zip: 'this zip file does not contain only dicom, jpg and png images only',
  };

  const renderErrorHandler = (
    errorType: ErrorTypes,
    errorDetails?: OrthancServerErrorData | Details[]
  ) => {
    if (!error[errorType]) {
      return null;
    }
    if (error['server']) {
      const errorMsg = errorDetails as OrthancServerErrorData;
      return (
        // Type errors due to required defaults why not put defaults?
        <Typography className="pl-1 my-2" color="error">
          {t(
            `ErrorMessage: ${errorMsg?.Message}, Details:${errorMsg?.Details}`
          )}
        </Typography>
      );
    }
    if (error['detail']) {
      const errorMsgArr = errorDetails as Details[];

      console.error('errorMsgArr', errorMsgArr);
      return (
        // Type errors due to required defaults why not put defaults?
        <div className="flex flex-col gap-2">
          {errorMsgArr.map((err: Details, index: number) => (
            <Typography className="pl-1 my-2" color="error" key={index}>
              {t(`${index}). ErrorType: ${err.type}, Details:${err.msg}`)}
            </Typography>
          ))}
        </div>
      );
    }
    return (
      // Type errors due to required defaults why not put defaults?
      <Typography className="pl-1 mt-2" color="error">
        {error_messages[errorType]}
      </Typography>
    );
  };
  const renderSuccessMessageHandler = (
    success: OrthancServerSuccessData | undefined
  ) => {
    console.log('renderSuccessMessageHandler', success);
    if (success) {
      return (
        // Type errors due to required defaults why not put defaults?
        <div
          className={`pl-1 my-2 ${
            success?.Status?.toLocaleLowerCase() == 'success'
              ? ' text-green-500'
              : ' text-yellow-500'
          }`}
        >
          <Typography color="inherit">
            {t(`${success.Status}: ${
              success?.Status?.toLocaleLowerCase() == 'success'
                ? 'in adding '
                : ''
            } Series -> ${success.ParentSeries} of PatientId -> ${
              success.ParentPatient
            } of Study with Id -> ${success.ParentStudy},
            `)}
          </Typography>
        </div>
      );
    }
    return null;
  };

  // Image preview
  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(IntialErrorState);
    if (!e.target.files || e.target.files.length === 0) {
      setError(initState => ({
        ...initState,
        filename: true,
      })); // file selection error
      setSelectedFile(undefined);
      return;
    }

    const singleFile = e.target.files[0];
    // check if the user as selected the right size 100mbs
    if (singleFile.size > 10000000) {
      setError(initState => ({
        ...initState,
        filesize: true,
      })); // active filesize error
      setSelectedFile(undefined);
    }

    const checkType = isFileTypeOkay(singleFile.name, [
      'png',
      'jpg',
      'jpeg',
      'dcm',
    ]); // add extension here to be accepted

    // check file type and render error messages
    if (!checkType) {
      setError(initState => ({
        ...initState,
        format: true,
      })); // active filesize error
      setSelectedFile(undefined);
    }

    // check content of the file if zip
    const filenameEncoding = 'utf-8'; // can change depending on the encoding type
    if (isFileTypeOkay(singleFile.name, ['zip'])) {
      console.log('is a zip');
      const entries = await readZipFiles().getEntries(singleFile, {
        filenameEncoding,
      }); //TODO: .rar .zip and others
      // const isDicomZip = entries
      //   .map(
      //     entry =>
      //       entry?.filename?.split('.')[entry?.filename?.split('.').length - 1]
      //   )
      //   .includes('dcm');

      const isDicomZip = entries.some(
        entry =>
          ['dcm'].includes(
            entry?.filename?.split('.')[entry?.filename?.split('.').length - 1]
          ) //no need of complications with png and jpg
      );
      // Strict check of the zip files if any file inside is not of the required format

      if (!isDicomZip) {
        setError(initState => ({
          ...initState,
          format: true,
          zip: true,
        }));
      }
    }

    // get the first file only
    setSelectedFile(singleFile);
  };

  return (
    <div>
      {renderErrorHandler('detail', serverError)}
      {/*
      FIXME: REMOVE THIS
      {renderErrorHandler('server', serverError)} */}
      {renderSuccessMessageHandler(success)}
      <Typography variant="h6">
        {t('Please select a PNG or JPEG File.')}
      </Typography>

      <div className="mt-4 ml-2 space-y-3 flex flex-col">
        <div className="flex justify-center items-center gap-4">
          <Label htmlFor="patientId" className="mr-2">
            {t('Patient ID')}
          </Label>
          <Input
            id="patientId"
            name="patientId"
            type="text"
            className="mr-2"
            onChange={({ target }) => setPatientID(target.value)}
          />
        </div>
        <input
          id="file"
          type="file"
          className="mr-2"
          onChange={handleSelectFile}
        />
        {/* render file error messages */}
        {renderErrorHandler('filesize')}
        {renderErrorHandler('filename')}
        {renderErrorHandler('format')}
        {renderErrorHandler('zip')}
      </div>

      <div className="mt-8">
        <div
          className="p-4 rounded bg-secondary-dark border-secondary-primary"
          data-cy="image-preview"
        >
          <Typography variant="h5">{t('Image preview')}</Typography>

          {/* we can use the active viewport later if the doctor want the images on the view port probed*/}
          {!isFileTypeOkay(selectedFile?.name, [
            'jpg',
            'png',
            'gif',
            'jpeg',
          ]) ? (
            <Typography className="mt-4">
              {t('Current Image cannot be displayed')}
            </Typography>
          ) : (
            <img
              alt="No preview"
              src={preview}
              className="mx-auto my-2"
              style={{
                maxHeight: defaultSize,
                width: 'auto',
              }}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          name="cancel"
          type={ButtonEnums.type.secondary}
          onClick={onClose}
          size={ButtonEnums.size.medium}
        >
          {t('Cancel')}
        </Button>
        <Button
          className="ml-2"
          disabled={hasError}
          onClick={upload}
          size={ButtonEnums.size.medium}
          type={ButtonEnums.type.primary}
          name={'upload'}
        >
          {isLoading ? t('Uploading...') : t('Upload')}
        </Button>
      </div>
    </div>
  );
};

export default UploadImageForm;

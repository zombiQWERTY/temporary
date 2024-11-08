'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { QueryObserverBaseResult } from '@tanstack/query-core';
import { useTranslations } from 'next-intl';
import { map } from 'ramda';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  UploadDocuments,
  fileMappers,
  UploadsHandler,
} from '@/features/uploads';
import { UploadApi, useDocumentsByType } from '@/entities/Documents';
import { ProvideExtraApi } from '@/entities/Verifications';
import { ServerError } from '@/shared/api';
import { useUser } from '@/shared/auth';
import { useToast } from '@/shared/lib';
import { useProvideExtraDocumentsData } from '../lib/useProvideExtraDocumentsData';
import { ExtraDataSchema } from '../model/types';

const defaultValues: ExtraDataSchema = {
  fileIds: [],
};

const dataMappers = {
  toForm: (): ExtraDataSchema => {
    return {
      fileIds: [],
    };
  },
  fromForm: (data: ExtraDataSchema): ProvideExtraApi.ProvideExtraArgsSchema => {
    return {
      fileIds: fileMappers.fromUploaderToForm(data.fileIds),
    };
  },
};

interface DocumentsFormProps {
  refetch: QueryObserverBaseResult['refetch'];
}

export const DocumentsForm = ({ refetch }: DocumentsFormProps) => {
  const { data: user, update } = useUser();
  const toast = useToast();
  const t = useTranslations('Profile.Forms.DocumentsData');

  const { otherDocuments, isFetched } = useDocumentsByType();

  const form = useForm<ExtraDataSchema>({
    mode: 'onSubmit',
    defaultValues: user ? dataMappers.toForm() : defaultValues,
    resolver: zodResolver(ExtraDataSchema),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
    setValue,
  } = form;

  useEffect(() => {
    if (isFetched && otherDocuments.length) {
      setValue('fileIds', map(fileMappers.fromServer, otherDocuments));
    }
  }, [otherDocuments, isFetched, setValue]);

  const { mutateAsync } = useProvideExtraDocumentsData();

  const onSubmit = async (values: ExtraDataSchema) => {
    const dataToProcess = dataMappers.fromForm(values);

    try {
      await mutateAsync(dataToProcess)
        .then(update)
        .then(() => refetch());
    } catch (e: unknown) {
      const { error } = e as ServerError;
      toast.error(error);
      return;
    }

    toast.success(t('request_completed_successfully'));
  };

  const uploadHandler: UploadsHandler = (arg) =>
    UploadApi.request(arg).then(({ files }) =>
      files.map((f) => fileMappers.fromServer({ ...f, fileId: f.id }, true)),
    );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <UploadDocuments
          name="fileIds"
          multiple
          uploadHandler={uploadHandler}
        />
        <Stack sx={{ mt: 5 }} alignItems="start">
          <LoadingButton
            variant="contained"
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
          >
            {t('save')}
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
};

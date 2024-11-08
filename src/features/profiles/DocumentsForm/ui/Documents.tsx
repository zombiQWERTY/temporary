'use client';
import { Grid, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { map } from 'ramda';
import { fileMappers, Previews } from '@/features/uploads';
import { GetAllMyDocumentsApi, useDocumentsByType } from '@/entities/Documents';
import { DocumentsForm } from './DocumentsForm';

const EmptyState = ({ message }: { message: string }) => (
  <Typography
    variant="body1"
    sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}
  >
    {message}
  </Typography>
);

export const Documents = () => {
  const t = useTranslations('Profile.Forms.DocumentsData');

  const {
    identitySecondPackDocuments,
    identityFirstPackDocuments,
    economicDocuments,
    locationDocuments,
    taxesDocuments,
    applicationFormDocuments,
    refetch,
  } = useDocumentsByType();

  const renderDocuments = (
    documents: GetAllMyDocumentsApi.ServerDocument[],
    title: string,
  ) => (
    <Grid item xs={12} md={6} lg={6} mb={5}>
      <Typography variant="Heading07" sx={{ mb: 5 }} component="p">
        {title}
      </Typography>
      {documents.length > 0 ? (
        <Previews files={map(fileMappers.fromServer, documents)} />
      ) : (
        <EmptyState message={t('no_documents_available')} />
      )}
    </Grid>
  );

  return (
    <Grid container spacing={6}>
      {renderDocuments(
        identityFirstPackDocuments,
        t('identity_confirmation_first_document'),
      )}
      {renderDocuments(
        identitySecondPackDocuments,
        t('identity_confirmation_second_document'),
      )}
      {renderDocuments(locationDocuments, t('address_confirmation'))}
      {renderDocuments(economicDocuments, t('income_proof'))}
      {renderDocuments(taxesDocuments, t('tax_documents'))}
      {renderDocuments(
        applicationFormDocuments,
        t('application_form_documents'),
      )}
      <Grid item xs={12} md={6} lg={6} mb={5}>
        <Typography variant="Heading07" sx={{ mb: 5 }} component="p">
          {t('other_documents')}
        </Typography>
        <DocumentsForm refetch={refetch} />
      </Grid>
    </Grid>
  );
};

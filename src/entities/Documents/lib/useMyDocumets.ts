import { useMemo } from 'react';

import { useGetAllMyDocuments } from '@/entities/Documents/lib/useGetAllMyDocuments';
import { DocumentTypeEnum } from '../model';

export const useDocumentsByType = () => {
  const { response, isLoading, refetch, isFetched } = useGetAllMyDocuments();

  const groupedDocuments = useMemo(() => {
    if (!response || isLoading) {
      return {};
    }

    return (
      response?.documents.reduce(
        (acc, document) => {
          const key = document.type;
          return {
            ...acc,
            [key]: [...(acc[key] || []), document],
          };
        },
        {} as Record<string, typeof response.documents>,
      ) ?? {}
    );
  }, [response, isLoading]);

  return {
    refetch,
    isFetched,
    identityFirstPackDocuments:
      groupedDocuments[DocumentTypeEnum.IdentityFirstPack] || [],
    identitySecondPackDocuments:
      groupedDocuments[DocumentTypeEnum.IdentitySecondPack] || [],
    locationDocuments: groupedDocuments[DocumentTypeEnum.Location] || [],
    economicDocuments: groupedDocuments[DocumentTypeEnum.Economic] || [],
    taxesDocuments: groupedDocuments[DocumentTypeEnum.Taxes] || [],
    otherDocuments: groupedDocuments[DocumentTypeEnum.Other] || [],
    applicationFormDocuments:
      groupedDocuments[DocumentTypeEnum.ApplicationFormForNaturalPersons] || [],
  };
};

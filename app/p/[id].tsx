import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ArticleAlias() {
  const { id } = useLocalSearchParams();
  return <Redirect href={`/article/${id}`} />;
}

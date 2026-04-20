import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AnswerAlias() {
  const { id } = useLocalSearchParams();
  return <Redirect href={`/answer/${id}`} />;
}

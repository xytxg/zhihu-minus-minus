import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AnswerAlias() {
  const { answerId } = useLocalSearchParams();
  return <Redirect href={`/answer/${answerId}`} />;
}

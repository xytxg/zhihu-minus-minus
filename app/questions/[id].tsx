import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function QuestionsAlias() {
  const { id } = useLocalSearchParams();
  return <Redirect href={`/question/${id}`} />;
}

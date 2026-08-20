import { ChoiceView } from './ChoiceView';
import { ChipsView } from './ChipsView';
import { MatchingView } from './MatchingView';
import { SpokenView } from './SpokenView';
import { TextView } from './TextView';
import { WordBankView } from './WordBankView';
import type { ExerciseViewProps } from './types';

export function ExerciseView(props: ExerciseViewProps) {
  switch (props.exercise.type) {
    case 'multiple-choice':
    case 'listen-choice':
      return <ChoiceView {...props} />;
    case 'sentence-builder':
    case 'ordering':
      return <ChipsView {...props} />;
    case 'matching':
      return <MatchingView {...props} />;
    case 'spoken':
      return <SpokenView {...props} />;
    case 'word-bank-translation':
      return <WordBankView {...props} />;
    default:
      return <TextView {...props} />;
  }
}

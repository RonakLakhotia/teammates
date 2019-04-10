import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { FeedbackMsqQuestionDetails, FeedbackParticipantType } from '../../../../types/api-output';
import { DEFAULT_MSQ_QUESTION_DETAILS } from '../../../../types/default-question-structs';
import { NO_VALUE } from '../../../../types/feedback-response-details';
import { QuestionEditDetailsFormComponent } from './question-edit-details-form.component';

/**
 * Question details edit form component for Msq question.
 */
@Component({
  selector: 'tm-msq-question-edit-details-form',
  templateUrl: './msq-question-edit-details-form.component.html',
  styleUrls: ['./msq-question-edit-details-form.component.scss'],
})
export class MsqQuestionEditDetailsFormComponent
    extends QuestionEditDetailsFormComponent<FeedbackMsqQuestionDetails> {

  readonly PARTICIPANT_TYPES: string[] = [FeedbackParticipantType.STUDENTS,
    FeedbackParticipantType.STUDENTS_EXCLUDING_SELF, FeedbackParticipantType.TEAMS,
    FeedbackParticipantType.TEAMS_EXCLUDING_SELF, FeedbackParticipantType.INSTRUCTORS];

  constructor() {
    super(DEFAULT_MSQ_QUESTION_DETAILS());
  }

  /**
   * Reorders the list on dragging the Msq options.
   */
  onMsqOptionDropped(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.model.msqChoices, event.previousIndex, event.currentIndex);
    moveItemInArray(this.model.msqWeights, event.previousIndex, event.currentIndex);
  }

  /**
   * Displays new Msq weight at specified index.
   */
  onMsqWeightEntered(event: number, index: number): void {
    const copyMsqWeights: number[] = this.model.msqWeights.slice();
    copyMsqWeights[index] = event;
    this.triggerModelChange('msqWeights', copyMsqWeights);
  }

  /**
   * Increases number of Msq options.
   */
  increaseNumberOfMsqOptions(): void {
    const copyMsqChoices: string[] = this.model.msqChoices.slice();
    copyMsqChoices.push('');
    this.triggerModelChange('msqChoices', copyMsqChoices);
    if (this.model.hasAssignedWeights) {
      const copyMsqWeights: number[] = this.model.msqWeights.slice();
      copyMsqWeights.push(0);
      this.triggerModelChange('msqWeights', copyMsqWeights);
    }
  }

  /**
   * Deletes a Msq option.
   */
  onMsqOptionDeleted(event: number): void {
    const copyMsqChoices: string[] = this.model.msqChoices.slice();
    copyMsqChoices.splice(event, 1);
    this.triggerModelChange('msqChoices', copyMsqChoices);
    if (this.model.hasAssignedWeights) {
      const copyMsqWeights: number[] = this.model.msqWeights.slice();
      copyMsqWeights.splice(event, 1);
      this.triggerModelChange('msqWeights', copyMsqWeights);
    }
  }

  /**
   * Displays maxSelectableOption value.
   */
  get displayValueForMaxSelectableOption(): number {
    return this.model.maxSelectableChoices === NO_VALUE ? 2 : this.model.maxSelectableChoices;
  }

  /**
   * Displays minSelectableOption value.
   */
  get displayValueForMinSelectableOption(): number {
    return this.model.minSelectableChoices === NO_VALUE ? 1 : this.model.minSelectableChoices;
  }

  /**
   * Displays new Msq option at specified index.
   */
  onMsqOptionEntered(event: string, index: number): void {
    const copyMsqChoices: string[] = this.model.msqChoices.slice();
    copyMsqChoices[index] = event;
    this.triggerModelChange('msqChoices', copyMsqChoices);
  }

  /**
   * Triggers the display of the weight for the other option.
   */
  triggerOtherWeight(event: any): void {
    if (!event.target.checked) {
      this.triggerModelChange('msqOtherWeight', 0);
    }
  }

  /**
   * Assigns a default value to generateOptionsFor when checkbox is clicked.
   */
  triggerGeneratedOptionsChange(event: any): void {
    const feedbackParticipantType: FeedbackParticipantType
        = event.target.checked ? FeedbackParticipantType.STUDENTS : FeedbackParticipantType.NONE;
    this.triggerModelChange('generateOptionsFor', feedbackParticipantType);
  }

  /**
   * Assigns a default value to maxSelectableOptions when checkbox is clicked.
   */
  triggerMaxSelectableOptionsChange(event: any): void {
    const maxSelectableChoices: number = event.target.checked ? 2 : NO_VALUE;
    this.triggerModelChange('maxSelectableChoices', maxSelectableChoices);
  }

  /**
   * Assigns a default value to minSelectableOptions when checkbox is clicked.
   */
  triggerMinSelectableOptionsChange(event: any): void {
    const minSelectableChoices: number = event.target.checked ? 1 : NO_VALUE;
    this.triggerModelChange('minSelectableChoices', minSelectableChoices);
  }

  /**
   * Tracks the Msq option by index.
   */
  trackMsqOption(index: number, item: string[]): string {
    return item[index];
  }

  /**
   * Tracks the Msq weight by index.
   */
  trackMsqWeight(index: number, item: number[]): number {
    return item[index];
  }

  /**
   * Checks if the generatedOptionsFor checkbox is enabled.
   */
  get isGeneratedOptionsEnabled(): boolean {
    return this.model.generateOptionsFor !== FeedbackParticipantType.NONE;
  }

  /**
   * Checks if the maxSelectedChoices checkbox is enabled.
   */
  get isMaxSelectableChoicesEnabled(): boolean {
    return this.model.maxSelectableChoices !== NO_VALUE;
  }

  /**
   * Checks if the minSelectedChoices checkbox is enabled.
   */
  get isMinSelectableChoicesEnabled(): boolean {
    return this.model.minSelectableChoices !== NO_VALUE;
  }

  /**
   * Returns maximum value that minSelectable option can take.
   */
  get maxMinSelectableValue(): number {
    if (!this.isMaxSelectableChoicesEnabled) {
      return this.model.msqChoices.length;
    }
    return this.model.maxSelectableChoices;
  }

  /**
   * Triggers the display of the weight column for the Msq options if weights option is checked/unchecked.
   */
  triggerWeightsColumn(event: any): void {
    if (!event.target.checked) {
      this.triggerModelChange('msqWeights', []);
      this.triggerModelChange('msqOtherWeight', 0);
    } else {
      this.triggerModelChange('msqWeights', Array(this.model.msqChoices.length).fill(0));
    }
  }
}

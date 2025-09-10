import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var html2pdf: any; // Declare html2pdf for TypeScript

@Component({
  selector: 'app-eye-test',
  templateUrl: './eye-test.component.html',
  styleUrls: ['./eye-test.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EyeTestComponent implements AfterViewInit {
  @ViewChild('colorPlate') colorPlate!: ElementRef<HTMLCanvasElement>;

  currentStep: string = 'consent';
  currentRound: number = 0;
  currentTest: number = 0;
  totalTestsCompleted: number = 0;
  correctAnswers: number = 0;
  colorTestIndex: number = 0;
  colorCorrectAnswers: number = 0;
  testsPerEye: number = 5;
  sizes: number[] = [3, 3, 2.5, 2.5, 2];
  allCharacters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  colorTests = [
    { number: '8', bgColor: '#00FF00', numColor: '#FF0000' },  // Second test
    { number: '5', bgColor: '#FF69B4', numColor: '#FFFF00' }   // Third test
  ];

  eyeInstruction: string = 'left';
  currentLetter: string = 'A';
  letterSize: number = 3;
  letterTransform: string = 'rotate(0deg)';
  showCheckmark: boolean = false;
  result: string = '';
  resultIsCorrect: boolean = false;
  showNextTest: boolean = false;
  showNextRound: boolean = false;
  showColorTestButton: boolean = false;
  colorInput: string = '';
  colorResult: string = '';
  colorResultIsCorrect: boolean = false;
  showNextColorTest: boolean = false;
  showFinishTest: boolean = false;
  finalResult: string = '';

  ngAfterViewInit() {
    if (this.currentStep === 'color-test-area') {
      this.generateColorPlate();
    }
  }

  showInstructions() {
    this.currentStep = 'instructions';
  }

  showBrightnessConfirmation() {
    this.currentStep = 'brightness-confirmation';
  }

  showPreparationConfirmation() {
    this.currentStep = 'preparation-confirmation';
  }

  startTest(round: number) {
    this.currentRound = round;
    this.currentTest = 0;
    this.totalTestsCompleted = this.currentRound === 1 ? 0 : 5;
    this.correctAnswers = this.currentRound === 1 ? 0 : this.correctAnswers;
    this.currentStep = 'test-area';
    this.showNextRound = false;
    this.showNextTest = false;
    this.showColorTestButton = false;
    this.eyeInstruction = round === 1 ? 'left' : 'right';
    this.generateLetter();
  }

  generateLetter() {
    this.currentLetter = this.allCharacters[Math.floor(Math.random() * this.allCharacters.length)];
    this.letterSize = this.sizes[this.currentTest];
    this.letterTransform = this.currentTest === 1 || this.currentTest === 3 ? 'rotate(180deg)' : 'rotate(0deg)';
    this.showCheckmark = false;
    this.result = '';
    this.resultIsCorrect = false;
  }

  checkAnswer(selected: string) {
    if (selected === this.currentLetter) {
      this.correctAnswers++;
      this.showCheckmark = true;
      this.result = 'Correct';
      this.resultIsCorrect = true;
      setTimeout(() => {
        this.showCheckmark = false;
        this.nextTest();
      }, 1000);
    } else {
      this.result = 'Wrong';
      this.resultIsCorrect = false;
      setTimeout(() => this.nextTest(), 1000);
    }
  }

  nextTest() {
    this.currentTest++;
    this.totalTestsCompleted++;
    console.log(`Test ${this.totalTestsCompleted} completed`);
    if (this.currentTest < this.testsPerEye) {
      this.result = '';
      this.showNextTest = false;
      this.generateLetter();
    } else if (this.totalTestsCompleted === this.testsPerEye * 2) {
      this.showNextRound = false;
      this.showColorTestButton = true;
    } else {
      this.showNextRound = true;
    }
  }

  startColorTest() {
    this.colorTestIndex = 0;
    this.colorCorrectAnswers = 0;
    this.currentStep = 'color-test-area';
    this.generateColorPlate();
  }

  generateColorPlate() {
    const canvas = this.colorPlate.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context is null');
      return;
    }

    const test = this.colorTests[this.colorTestIndex];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw random dots for the pattern
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = test.bgColor;
      ctx.fill();
    }

    // Draw the number
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = test.numColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(test.number, canvas.width / 2, canvas.height / 2);

    this.colorInput = '';
    this.colorResult = '';
    this.colorResultIsCorrect = false;
    this.showNextColorTest = false;
    this.showFinishTest = false;
  }

  checkColorAnswer() {
    const userInput = this.colorInput.trim();
    const correctNumber = this.colorTests[this.colorTestIndex].number;
    if (userInput === correctNumber) {
      this.colorCorrectAnswers++;
      this.colorResult = 'Correct';
      this.colorResultIsCorrect = true;
    } else {
      this.colorResult = 'Wrong';
      this.colorResultIsCorrect = false;
    }
    this.showNextColorTest = this.colorTestIndex < this.colorTests.length - 1;
    this.showFinishTest = this.colorTestIndex === this.colorTests.length - 1;
  }

  nextColorTest() {
    this.colorTestIndex++;
    this.generateColorPlate();
  }

  finishTest() {
    this.currentStep = 'result-area';
    let accuracy = '';
    const totalTests = this.testsPerEye * 2;
    const scorePercentage = (this.correctAnswers / totalTests) * 100;
    if (scorePercentage >= 90) {
      accuracy = 'Your vision appears to be 20/20 or excellent based on this test.';
    } else if (scorePercentage >= 60) {
      accuracy = 'Your vision may be mildly impaired (e.g., 20/40). Consult an eye care professional.';
    } else {
      accuracy = 'Your vision may be significantly impaired. Please see an eye care professional soon.';
    }
    let colorAccuracy = '';
    if (this.colorCorrectAnswers === this.colorTests.length) {
      colorAccuracy = 'You correctly identified all color patterns, suggesting normal color vision.';
    } else if (this.colorCorrectAnswers < this.colorTests.length) {
      colorAccuracy = `You correctly identified ${this.colorCorrectAnswers} out of ${this.colorTests.length} color patterns. This may indicate potential color blindness (e.g., red-green or blue-yellow deficiency). Consult an eye care professional for a detailed Ishihara test.`;
    }
    this.finalResult = `Test completed! Visual acuity: ${this.correctAnswers} out of ${totalTests} correct (${scorePercentage.toFixed(0)}%). ${accuracy} Color vision: ${colorAccuracy}`;
  }

  downloadPDF() {
    const element = document.getElementById('pdf-content');
    if (!element) {
      console.error('Element with ID "pdf-content" not found in the DOM');
      return;
    }
    if (typeof html2pdf === 'undefined') {
      console.error('html2pdf library is not loaded. Ensure the script is included in index.html');
      return;
    }

    // Ensure the element is fully rendered
    setTimeout(() => {
      html2pdf()
        .from(element)
        .set({
          margin: 10,
          filename: 'eye-test-report.pdf',
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()
        .catch((error: unknown) => {
          console.error('PDF generation failed:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            if (error.stack) {
              console.error('Stack trace:', error.stack);
            }
          }
        });
    }, 100); // Small delay to ensure DOM is ready
  }
}
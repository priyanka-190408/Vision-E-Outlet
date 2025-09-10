import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  cartItems: any[] = [];
  totalAmount: number = 0;
  selectedPaymentMethod: string = '';
  upiId: string = '';
  cardNumber: string = '';
  cvv: string = '';
  expiryDate: string = '';

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.totalAmount = this.cartService.getTotal();
  }

  onPaymentMethodChange() {
    this.upiId = '';
    this.cardNumber = '';
    this.cvv = '';
    this.expiryDate = '';
  }

  validateUpiId() {
    this.upiId = this.upiId.trim();
  }

  validateCardNumber() {
    this.cardNumber = this.cardNumber.replace(/[^0-9]/g, '');
  }

  validateCvv() {
    this.cvv = this.cvv.replace(/[^0-9]/g, '');
  }

  validateExpiryDate() {
    this.expiryDate = this.expiryDate.replace(/[^0-9/]/g, '');
    if (this.expiryDate.length === 2 && !this.expiryDate.includes('/')) {
      this.expiryDate += '/';
    }
  }

  isPaymentValid(): boolean {
    if (this.selectedPaymentMethod === 'netbanking') {
      return this.upiId.trim() !== '' && this.upiId.includes('@');
    } else if (this.selectedPaymentMethod === 'card') {
      const expiryDateValid = this.expiryDate.match(/^\d{2}\/\d{2}$/) !== null;
      if (expiryDateValid) {
        const [month, year] = this.expiryDate.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const isDateValid = month >= 1 && month <= 12 && (year > currentYear || (year === currentYear && month >= currentMonth));
        return this.cardNumber.trim().length === 16 && this.cvv.trim().length === 3 && isDateValid;
      }
      return false;
    } else if (this.selectedPaymentMethod === 'cod') {
      return true;
    }
    return false;
  }

  confirmPayment() {
    if (!this.isPaymentValid()) {
      alert('Please fill in all required payment details correctly.');
      return;
    }

    let paymentMessage = this.selectedPaymentMethod === 'cod' ? 'Order placed! Payment due on delivery.' : 'Payment successful!';
    this.generatePDF();
    this.cartService.clearCart();
    alert(`${paymentMessage} Cart cleared.`);
    this.router.navigate(['/home']);
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.text('Payment Summary', 10, 10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.text('Items:', 10, 30);
    
    let yPos = 40;
    this.cartItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - $${item.price} (Size: ${item.size})`, 10, yPos);
      yPos += 10;
    });
    
    doc.text(`Total Amount: $${this.totalAmount}`, 10, yPos + 10);
    doc.text(`Payment Method: ${this.selectedPaymentMethod === 'cod' ? 'Payment on Delivery' : this.selectedPaymentMethod}`, 10, yPos + 20);
    
    if (this.selectedPaymentMethod === 'netbanking') {
      doc.text(`UPI ID: ${this.upiId}`, 10, yPos + 30);
    } else if (this.selectedPaymentMethod === 'card') {
      doc.text(`Card Number: ${this.cardNumber.slice(-4).padStart(16, '*')}`, 10, yPos + 30);
    }

    doc.save('payment-summary.pdf');
  }
}
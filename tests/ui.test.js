import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('UI Elements Tests', () => {
  beforeEach(() => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html;
  });

  describe('Header Elements', () => {
    test('should have a site header with title', () => {
      const header = document.querySelector('.site-header');
      expect(header).toBeInTheDocument();
      const title = header.querySelector('.site-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('crack-o-date');
    });

    test('should have a header date element', () => {
      const headerDate = document.querySelector('#header-date');
      expect(headerDate).toBeInTheDocument();
      expect(headerDate).toHaveAttribute('role', 'button');
      expect(headerDate).toHaveAttribute('tabindex', '0');
    });

    test('should have a menu button', () => {
      const menuButton = document.querySelector('.menu-button');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Menu');
    });
  });

  describe('Game Container Elements', () => {
    test('should have all required game sections', () => {
      expect(document.querySelector('#error-message')).toBeInTheDocument();
      expect(document.querySelector('#date-buttons')).toBeInTheDocument();
      expect(document.querySelector('#operator-buttons')).toBeInTheDocument();
      expect(document.querySelector('.equation-builder')).toBeInTheDocument();
    });

    test('should have equation builder elements', () => {
      const equationBuilder = document.querySelector('.equation-builder');
      expect(equationBuilder.querySelector('#left-side')).toBeInTheDocument();
      expect(equationBuilder.querySelector('#equals-sign')).toBeInTheDocument();
      expect(equationBuilder.querySelector('#right-side')).toBeInTheDocument();
    });

    test('should have equation values display', () => {
      const equationValues = document.querySelector('.equation-values');
      expect(equationValues).toBeInTheDocument();
      expect(equationValues.querySelector('#left-value')).toHaveTextContent('?');
      expect(equationValues.querySelector('#right-value')).toHaveTextContent('?');
    });

    test('should have control buttons', () => {
      const controls = document.querySelector('.controls');
      expect(controls.querySelector('#clear-button')).toBeInTheDocument();
      expect(controls.querySelector('#check-button')).toBeInTheDocument();
    });
  });

  describe('Modal Elements', () => {
    test('should have main modal structure', () => {
      const modal = document.querySelector('#modal');
      expect(modal).toBeInTheDocument();
      expect(modal.querySelector('.modal-content')).toBeInTheDocument();
      expect(modal.querySelector('.modal-close')).toBeInTheDocument();
      expect(modal.querySelector('.modal-header')).toBeInTheDocument();
      expect(modal.querySelector('.modal-body')).toBeInTheDocument();
    });

    test('should have calendar modal structure', () => {
      const calendarModal = document.querySelector('#calendar-modal');
      expect(calendarModal).toBeInTheDocument();
      expect(calendarModal.querySelector('.calendar-header')).toBeInTheDocument();
      expect(calendarModal.querySelector('.calendar-grid')).toBeInTheDocument();
      expect(calendarModal.querySelector('.calendar-weekdays')).toBeInTheDocument();
      expect(calendarModal.querySelector('.calendar-days')).toBeInTheDocument();
    });
  });

  describe('Footer Elements', () => {
    test('should have footer with copyright', () => {
      const footer = document.querySelector('.site-footer');
      expect(footer).toBeInTheDocument();
      expect(footer.querySelector('.footer-content')).toBeInTheDocument();
      expect(footer.querySelector('.footer-bottom')).toBeInTheDocument();
      expect(footer.querySelector('#current-year')).toBeInTheDocument();
    });
  });

  describe('Required Assets', () => {
    test('should have all required favicon and manifest files', () => {
      const head = document.querySelector('head');
      expect(head.querySelector('link[href="favicon.ico"]')).toBeInTheDocument();
      expect(head.querySelector('link[href="favicon-32x32.png"]')).toBeInTheDocument();
      expect(head.querySelector('link[href="favicon-16x16.png"]')).toBeInTheDocument();
      expect(head.querySelector('link[href="apple-touch-icon.png"]')).toBeInTheDocument();
      expect(head.querySelector('link[href="site.webmanifest"]')).toBeInTheDocument();
    });
  });
}); 
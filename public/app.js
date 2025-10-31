// API client for Reflection Agent
class ReflectionAgentAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000';
  }

  async reflect(theme) {
    const response = await fetch(`${this.baseURL}/api/reflect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

class ReflectionUI {
  constructor() {
    this.api = new ReflectionAgentAPI();
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.themeSelect = document.getElementById('theme-select');
    this.themeInput = document.getElementById('theme-input');
    this.generateBtn = document.getElementById('generate-btn');
    this.resultsSection = document.getElementById('results-section');
    this.iterationsContainer = document.getElementById('iterations-container');
    this.finalPhrase = document.getElementById('final-phrase');
    this.iterationCount = document.getElementById('iteration-count');
    this.finalScore = document.getElementById('final-score');
    this.status = document.getElementById('status');
  }

  attachEventListeners() {
    this.generateBtn.addEventListener('click', () => this.handleGenerate());
    this.themeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleGenerate();
      }
    });
    // Clear select when typing custom theme
    this.themeInput.addEventListener('input', () => {
      if (this.themeInput.value.trim()) {
        this.themeSelect.value = '';
      }
    });
    // Clear input when selecting from dropdown
    this.themeSelect.addEventListener('change', () => {
      if (this.themeSelect.value) {
        this.themeInput.value = '';
      }
    });
  }

  getSelectedTheme() {
    const selectTheme = this.themeSelect.value.trim();
    const inputTheme = this.themeInput.value.trim();
    return selectTheme || inputTheme;
  }

  async handleGenerate() {
    const theme = this.getSelectedTheme();
    if (!theme) {
      alert('Please select or enter a theme');
      return;
    }

    this.setLoading(true);
    this.clearResults();

    try {
      const result = await this.api.reflect(theme);
      this.displayResults(result);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please check the console.');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.generateBtn.disabled = loading;
    const btnText = this.generateBtn.querySelector('.btn-text');
    const btnLoader = this.generateBtn.querySelector('.btn-loader');

    if (loading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  }

  clearResults() {
    this.iterationsContainer.innerHTML = '';
    this.finalPhrase.textContent = '';
    this.resultsSection.classList.add('hidden');
  }

  displayResults(result) {
    this.resultsSection.classList.remove('hidden');

    // Update stats
    this.iterationCount.textContent = result.totalIterations;
    const lastIteration = result.iterations[result.iterations.length - 1];
    this.finalScore.textContent = lastIteration.qualityScore.toFixed(2);
    this.status.textContent = result.stoppedEarly ? '✓ Stopped Early' : 'Completed';
    this.status.style.color = result.stoppedEarly ? '#10b981' : '#f59e0b';

    // Display iterations
    result.iterations.forEach((iteration, index) => {
      setTimeout(() => {
        this.displayIteration(iteration);
      }, index * 300);
    });

    // Display final phrase
    setTimeout(() => {
      this.finalPhrase.textContent = result.finalResponse;
    }, result.iterations.length * 300);
  }

  displayIteration(iteration) {
    const card = document.createElement('div');
    card.className = 'iteration-card';

    const qualityClass = this.getQualityClass(iteration.qualityScore);
    const qualityLabel = this.getQualityLabel(iteration.qualityScore);

    card.innerHTML = `
      <div class="iteration-header">
        <span class="iteration-number">Iteration ${iteration.iteration}</span>
        <span class="quality-badge ${qualityClass}">
          Quality: ${iteration.qualityScore.toFixed(2)} (${qualityLabel})
        </span>
      </div>
      
      <div class="workflow-steps">
        <div class="step generator">
          <div class="step-title">🤖 Generator</div>
          <div class="step-content">${this.escapeHtml(iteration.response)}</div>
        </div>
        
        <div class="step reflector">
          <div class="step-title">🔍 Reflector</div>
          <div class="step-content">${this.escapeHtml(iteration.feedback)}</div>
        </div>
        
        ${iteration.iteration > 1 ? `
          <div class="step refiner">
            <div class="step-title">✨ Refiner</div>
            <div class="step-content">Refined based on feedback from iteration ${iteration.iteration - 1}</div>
          </div>
        ` : ''}
      </div>
    `;

    this.iterationsContainer.appendChild(card);
  }

  getQualityClass(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  getQualityLabel(score) {
    if (score >= 0.7) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ReflectionUI();
});


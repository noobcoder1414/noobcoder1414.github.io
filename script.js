  
document.addEventListener("DOMContentLoaded", () => {
  const propertyType = document.getElementById("propertyType");
  const makanOptions = document.getElementById("makanOptions");
  const makanType = document.getElementById("makanType");
  const summary = document.getElementById("propertySummary");
  

  propertyType.addEventListener("change", () => {
    const selected = propertyType.value;
    const extraFieldsContainer = document.getElementById('extraFields');

      // Clear previous extra fields
  extraFieldsContainer.innerHTML = "";

    // Show Makan options if "makan" selected
    if (selected === "makan") {
      makanOptions.classList.remove("d-none");  // Show the Makan Type dropdown
      summary.value = "";  // Clear the summary field when Makan is selected
    } else {
      makanOptions.classList.add("d-none");  // Hide the Makan Type dropdown for non-Makan types
      summary.value = "";  // Clear the summary if property type is not Makan
    }

    // Auto-fill summary based on property type
    let summaryText = "";
    if (selected === "independent") {
      summaryText = "Independent property consists of 1st and second floor with open roof";
    } else if (selected === "flat") {
      extraFieldsContainer.innerHTML = `
      <div class="form-group mt-2">
        <label for="flatNumber">Flat Number</label>
        <input type="text" id="flatNumber" name="flatNumber" class="form-control" required>
      </div>
      <div class="form-group mt-2">
        <label for="floorNumber">Floor Number</label>
        <input type="text" id="floorNumber" name="floorNumber" class="form-control" required>
      </div>
    `;
    } else if (selected === "portion") {
      extraFieldsContainer.innerHTML = `
      <div class="form-group mt-2">
        <label for="portionArea">Portion Area (in Marla)</label>
        <input type="text" id="portionArea" name="portionArea" class="form-control" required>
      </div>
    `;
    } else if (selected === "makan" && makanType.value !== "") {
      summaryText = `${makanType.value} story house`;
    } else {
      summaryText = "";
    }

    summary.value = summaryText;  // Update the summary field
 
  });

  // Update summary when Makan Type is selected
  makanType.addEventListener("change", () => {
    const selectedMakanType = makanType.value;
    let summaryText = "";
    if (selectedMakanType) {
      summaryText = `${selectedMakanType} story house`;
      summary.value = summaryText;
    }
  });
  
  let currentStep = 1;
  const totalSteps = 4;
  
  // Function to show the current step and hide others
  const showStep = (step) => {
    // Loop through all form steps
    for (let i = 1; i <= totalSteps; i++) {
      const stepElement = document.getElementById(`step-${i}`);
      if (i === step) {
        stepElement.classList.remove('d-none'); // Show the current step
        stepElement.classList.add('d-block');   // Ensure the step is displayed
      } else {
        stepElement.classList.remove('d-block'); // Hide the other steps
        stepElement.classList.add('d-none');     // Ensure the other steps are hidden
      }
    }
  
    // Toggle visibility of the "Previous" and "Next" buttons
    document.getElementById('prevBtn').classList.toggle('d-none', step === 1);
    document.getElementById('nextBtn').classList.toggle('d-none', step === totalSteps);
    document.getElementById('submitBtn').classList.toggle('d-none', step !== totalSteps);
  };
  
  
 const validateCurrentStep = () => {
  const currentStepElement = document.getElementById(`step-${currentStep}`);
  const inputs = currentStepElement.querySelectorAll('input, select, textarea');

  for (let input of inputs) {
    if (input.hasAttribute('required') && !input.value.trim()) {
      input.classList.add('is-invalid'); // Bootstrap validation error class
      input.reportValidity();
      return false;
    } else {
      input.classList.remove('is-invalid');
    }
  }
  return true;
};

  
  
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (!validateCurrentStep()) {
      return; // agar validation fail ho to next step pe mat jao
    }
  
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  });
  
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep); // Show the previous step
    }
  });
  document.getElementById('challanForm').addEventListener('submit', (e) => {
    if (!validateCurrentStep()) {
      e.preventDefault(); // Form submit roko agar validation fail hai
      return;
    }
  
  });
  // Initially show the first step when the page loads
  showStep(currentStep);

  document.getElementById('challanForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Stop default form submission
    
    // Disable submit button
  const submitButton = document.getElementById('submitBtn');
  submitButton.disabled = true;
  submitButton.innerText = 'Submitting...'; // Optional: button ka text change


  
  // Remove Previous button
  const previousButton = document.getElementById('prevBtn');
  if (previousButton) {
    previousButton.remove();
  }
  
    const formData = new FormData(this);
  
    fetch('/submit', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      document.getElementById('message').innerHTML = `
        <div style="padding: 10px; margin-top: 10px; background-color: #d4edda; color: #155724; border-radius: 5px;">
          ${data}
        </div>`;
    
    })
    .catch(error => {
      console.error('Form submission error:', error);
      document.getElementById('message').innerHTML = `
        <div style="padding: 10px; margin-top: 10px; background-color: #f8d7da; color: #721c24; border-radius: 5px;">
          Error submitting form. Please try again.
        </div>`;
      });
     
        
      
      const formElements = document.querySelectorAll('input, select, button');
formElements.forEach(element => {
  element.disabled = true; // Disable form fields
});
  
  });
});
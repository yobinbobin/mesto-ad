const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorContent = formElement.querySelector(`#${inputElement.id}-error`);
  errorContent.textContent = errorMessage;
  errorContent.classList.add(settings.errorClass);
  inputElement.classList.add(settings.inputErrorClass);
  disableSubmitButton(formElement, settings);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorContent = formElement.querySelector(`#${inputElement.id}-error`);
  errorContent.classList.remove(settings.errorClass);
  errorContent.textContent = "";
  inputElement.classList.remove(settings.inputErrorClass);
  enableSubmitButton(formElement, settings);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (!inputElement.validity.valid) {
    const errorContent = inputElement.validity.patternMismatch
      ? inputElement.dataset.errorMessage
      : inputElement.validationMessage;
    showInputError(formElement, inputElement, errorContent, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

const hasInvalidInput = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (formElement, settings) => {
  const button = formElement.querySelector(settings.submitButtonSelector);
  button.classList.add(settings.inactiveButtonClass);
  button.disabled = true;
};

const enableSubmitButton = (formElement, settings) => {
  const button = formElement.querySelector(settings.submitButtonSelector);
  button.classList.remove(settings.inactiveButtonClass);
  button.disabled = false;
};

const toggleButtonState = (formElement, settings) => {
  hasInvalidInput(formElement, settings)
    ? disableSubmitButton(formElement, settings)
    : enableSubmitButton(formElement, settings);
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  toggleButtonState(formElement, settings);
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};
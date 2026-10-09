interface FieldController {
  input: HTMLInputElement;
  errorElement: HTMLElement;
  fieldElement: HTMLElement | null;
  validate: () => string | undefined;
}

function getRequiredElement<T extends Element>(form: HTMLFormElement, selector: string): T {
  const element = form.querySelector<T>(`:scope ${selector}`);

  if (!element) {
    throw new Error(`Auth dialog form is missing required element "${selector}".`);
  }

  return element;
}

export function createFieldController(
  form: HTMLFormElement,
  id: string,
  validate: (input: HTMLInputElement) => string | undefined
): FieldController {
  const input = getRequiredElement<HTMLInputElement>(form, `#${id}`);
  const errorElement = getRequiredElement<HTMLElement>(form, `#${id}-error`);

  return {
    input,
    errorElement,
    fieldElement: input.closest<HTMLElement>('.auth-dialog__field'),
    validate: () => validate(input),
  };
}

function updateFieldDisplay(field: FieldController, touched: Set<HTMLInputElement>): void {
  const message = field.validate();
  const isValid = !message;
  const shouldShowError = touched.has(field.input) && !isValid;

  field.input.setAttribute('aria-invalid', String(!isValid));
  field.errorElement.textContent = shouldShowError ? (message ?? '') : '';
  field.fieldElement?.classList.toggle('auth-dialog__field--invalid', shouldShowError);
}

export function setupFormValidation(
  submitButton: HTMLButtonElement,
  fields: FieldController[],
  dependencies: Array<[HTMLInputElement, FieldController[]]> = []
): () => void {
  const touched = new Set<HTMLInputElement>();

  function refreshSubmitState(): void {
    submitButton.disabled = fields.some((field) => field.validate());
  }

  function handleField(field: FieldController, shouldMarkTouched: boolean): void {
    if (shouldMarkTouched) {
      touched.add(field.input);
    }

    updateFieldDisplay(field, touched);
    refreshSubmitState();
  }

  for (const field of fields) {
    field.input.addEventListener('input', () => handleField(field, touched.has(field.input)));
    field.input.addEventListener('blur', () => handleField(field, true));
  }

  for (const [trigger, dependents] of dependencies) {
    const revalidateDependents = (): void => {
      for (const dependent of dependents) {
        updateFieldDisplay(dependent, touched);
      }

      refreshSubmitState();
    };

    trigger.addEventListener('input', revalidateDependents);
    trigger.addEventListener('blur', revalidateDependents);
  }

  refreshSubmitState();

  return function reset(): void {
    touched.clear();

    for (const field of fields) {
      field.input.setAttribute('aria-invalid', 'false');
      field.errorElement.textContent = '';
      field.fieldElement?.classList.remove('auth-dialog__field--invalid');
    }

    refreshSubmitState();
  };
}

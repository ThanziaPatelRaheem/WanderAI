import { test, expect } from "vitest";
import TravelForm from "../../components/TravelForm/TravelForm";
import { fireEvent, render, screen } from "@testing-library/react";

// Test 1: Verify that the destination input renders
test("renders the travel form fields", () => {
  render(<TravelForm />);

  expect(screen.getByLabelText("Destination")).toBeInTheDocument();
});

// Test 2: Verify that all form fields and the submit button render
test("renders all travel form fields and submit button", () => {
  render(<TravelForm />);

  expect(screen.getByLabelText("Destination")).toBeInTheDocument();
  expect(screen.getByLabelText("Number of days")).toBeInTheDocument();
  expect(screen.getByLabelText("Budget")).toBeInTheDocument();
  expect(screen.getByLabelText("Travel style")).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  ).toBeInTheDocument();
});

// Test 3: Component interaction test
// Verifies that entering a destination triggers the onChange handler,
// updates the React form state, and displays the entered value in the input.
test("updates destinatio when the user types", () => {
  render(<TravelForm />);

  const destinationInput = screen.getByLabelText("Destination");

  fireEvent.change(destinationInput, {
    target: { value: "Kyoto, Japan" },
  });

  expect(destinationInput).toHaveValue("Kyoto, Japan");
});

// Test 4: Component interaction test
// Verifies that selecting a budget updates the dropdown value.
test("updates budget when the user selects an option", () => {
  render(<TravelForm />);

  const budgetSelect = screen.getByLabelText("Budget");

  fireEvent.change(budgetSelect, {
    target: { value: "moderate" },
  });

  expect(budgetSelect).toHaveValue("moderate");
});

// Test 5: Component validation test
// Verifies that the destination field is required
// and the form is invalid when the field is empty.
test("prevents form submission when required fields are empty", () => {
  render(<TravelForm />);

  const destinationInput = screen.getByLabelText("Destination");

  expect(destinationInput).toBeRequired();
  expect(destinationInput).toBeInvalid();
});

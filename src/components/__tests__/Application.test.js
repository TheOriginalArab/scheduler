import React from "react";
import axios from "axios";

import {
  render,
  cleanup,
  wait,
  fireEvent,
  queryByText,
  findByText,
  getAllByTestId,
  getByAltText,
  getByPlaceholderText,
  getByText,
  findByAltText,
} from "@testing-library/react";

import Application from "components/Application";

afterEach(cleanup);
describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { queryByText, getByText, findByText } = render(<Application />);

    await findByText("Monday");

    fireEvent.click(getByText("Tuesday"));
    expect(queryByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container } = render(<Application />);

    await wait(() => findByText(container, "Archie Cohen"));

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(getByText(appointment, "Save"));

    //wait for the saving to finish and the interview to show
    await wait(() => {
      expect(
        queryByText(appointment, "Lydia Miller-Jones")
      ).toBeInTheDocument();
    });

    //Check that the "Monday" day now has the text "no spots remaining"
    await wait(() => {
      expect(getByText(day, "no spots remaining")).toBeInTheDocument();
    });
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    //1. Render the Application.
    const { container } = render(<Application />);

    //2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    //3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Delete"));

    //4. Check that the confirmation message is shown.
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    //5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));

    //6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    //7. Wait until the element with the "Add" button is displayed.
    await findByAltText(appointment, "Add");

    //8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    //1. Render the Application.
    const { container } = render(<Application />);

    //2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    //3. Click the "Edit" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    //4. change the name on the appointment
    fireEvent.click(getByAltText(appointment, "Edit"));
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    //5. Save the appointment
    fireEvent.click(getByText(appointment, "Save"));

    //6. Check that the element with the text "Saving" is displayed.
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    //7. Wait until the element with the new student name is displayed.
    await wait(() => {
      expect(
        queryByText(appointment, "Lydia Miller-Jones")
      ).toBeInTheDocument();
    });

    //8. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the save error when failing to save an appointment", async () => {
    axios.put.mockRejectedValueOnce();

    //1. Render the Application.
    const { container } = render(<Application />);

    //2. Wait until the text "Archie Cohen" is displayed.
    await wait(() => findByText(container, "Archie Cohen"));

    //3. Click the "Add" button on the first empty appointment.
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    //4. Enter the name "Lydia Miller-Jones" into the input field.
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    //5. Click the first interviewer in the list.
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    //6. Click the "Save" button on that same appointment.
    fireEvent.click(getByText(appointment, "Save"));

    //7. Check that the element with the text "Saving" is displayed.
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    //8. Wait until the element with the text "Could not save appointment" is displayed.
    await wait(() => {
      expect(
        queryByText(appointment, "Could not book appointment")
      ).toBeInTheDocument();
    });
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce();

    //1. Render the Application.
    const { container } = render(<Application />);

    //2. Wait until the text "Archie Cohen" is displayed.
    await wait(() => findByText(container, "Archie Cohen"));

    //3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );
    fireEvent.click(getByAltText(appointment, "Delete"));

    //4. Check that the confirmation message is shown.
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    //5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));

    //6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    //7. Wait until the element with the text "Could not cancel appointment" is displayed.
    await wait(() => {
      expect(
        queryByText(appointment, "Could not cancel appointment")
      ).toBeInTheDocument();
    });
  });
});

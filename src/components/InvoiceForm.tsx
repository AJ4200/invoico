"use client";

import { generatePDF } from "@/utils/generateDoc";
import { ChangeEvent, useState } from "react";

export default function InvoiceForm() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
  });

  const [services, setServices] = useState([
    { description: "", date: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setClientInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleInvoiceChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setInvoiceDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  type Service = {
    description: string;
    date: string;
    quantity: number;
    unitPrice: number;
    total: number;
  };

  const handleServiceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    const key = name as keyof Service;

    const newServices = [...services];

    // Using a switch statement to ensure correct type assignment
    switch (key) {
      case "quantity":
      case "unitPrice":
        newServices[index][key] = Number(value);
        break;
      case "description":
      case "date":
        newServices[index][key] = value;
        break;
    }

    // Recalculate the total for the service
    newServices[index].total =
      newServices[index].quantity * newServices[index].unitPrice;

    setServices(newServices);
  };

  const addService = () => {
    setServices([
      ...services,
      { description: "", date: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const calculateSubtotal = () => {
    return services.reduce((acc, service) => acc + service.total, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const totalAfterDiscount = subtotal - discount;
    return totalAfterDiscount + tax;
  };

  return (
    <div className="p-6 bg-rose-800 shadow-lg rounded-lg max-w-[80%] mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-center">Invoice Form</h2>
      <form>
        {/* Client and Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Client Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Client Information</h3>
            <div className="mb-4">
              <label className="block text-gray-100">Client Name</label>
              <input
                type="text"
                name="name"
                value={clientInfo.name}
                onChange={handleInputChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-100">Client Email</label>
              <input
                type="email"
                name="email"
                value={clientInfo.email}
                onChange={handleInputChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-100">Client Address</label>
              <input
                type="text"
                name="address"
                value={clientInfo.address}
                onChange={handleInputChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-100">Client Phone</label>
              <input
                type="text"
                name="phone"
                value={clientInfo.phone}
                onChange={handleInputChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Invoice Details</h3>
            <div className="mb-4">
              <label className="block text-gray-100">Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={invoiceDetails.invoiceNumber}
                onChange={handleInvoiceChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-100">Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={handleInvoiceChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-100">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={invoiceDetails.dueDate}
                onChange={handleInvoiceChange}
                className="input input-bordered input-ghost w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Services</h3>
          {services.map((service, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
            >
              <div>
                <label className="block text-gray-100">Description</label>
                <input
                  type="text"
                  name="description"
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, e)}
                  className="input input-bordered input-ghost w-full mb-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-100">Date of Service</label>
                <input
                  type="date"
                  name="date"
                  value={service.date}
                  onChange={(e) => handleServiceChange(index, e)}
                  className="input input-bordered input-ghost w-full mb-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-100">Quantity/Hours</label>
                <input
                  type="number"
                  name="quantity"
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, e)}
                  className="input input-bordered input-ghost w-full mb-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-100">Unit Price</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={service.unitPrice}
                  onChange={(e) => handleServiceChange(index, e)}
                  className="input input-bordered input-ghost w-full mb-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-100">Total</label>
                <input
                  type="number"
                  name="total"
                  value={service.total}
                  readOnly
                  className="input input-bordered input-ghost w-full mb-2"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="btn btn-error w-full"
                >
                  Remove Service
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="btn btn-secondary w-full mb-4"
          >
            Add Service
          </button>
        </div>

        {/* Tax and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-100">Tax</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value))}
              className="input input-bordered input-ghost w-full"
            />
          </div>
          <div>
            <label className="block text-gray-100">Discount</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              className="input input-bordered input-ghost w-full"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Notes</h3>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={4}
            placeholder="Additional notes or project summary"
          />
        </div>

        {/* Total Amount Due */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Total Amount Due</h3>
          <input
            type="number"
            value={calculateGrandTotal()}
            readOnly
            className="input input-bordered input-ghost w-full"
          />
        </div>

        {/* Generate Invoice Button */}
        <button
          type="button"
          onClick={() =>
            generatePDF(
              clientInfo,
              invoiceDetails,
              services,
              tax,
              discount,
              notes
            )
          }
          className="btn btn-primary w-full"
        >
          Generate Invoice PDF
        </button>
      </form>
    </div>
  );
}

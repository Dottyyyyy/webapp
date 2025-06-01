import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';

const AddStall = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);
    const [formValues, setFormValues] = useState({
        stallDescription: '',
        stallAddress: '',
        stallNumber: '',
        stallHours: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const pickImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formValues.stallDescription) errors.stallDescription = 'Description is required';
        if (!formValues.stallAddress) errors.stallAddress = 'Address is required';
        if (!formValues.stallHours) errors.stallHours = 'Hours are required';
        if (!formValues.stallNumber) errors.stallNumber = 'Stall number is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API}/vendor/add-stall/${user._id || user?.user?._id}`, {
                    ...formValues,
                    avatar,
                });

                toast.success('Stall added successfully!');
                navigate('/'); // Redirect to the vendor tab or appropriate route
            } catch (error) {
                console.error(error);
                toast.error('Failed to add stall. Please try again.');
            }
        } else {
            toast.error('Please fill in all required fields.');
        }
    };

    return (
        <div className="container">
            <h1>Add Vendor Stall</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="avatar">Stall Image</label>
                    <input type="file" id="avatar" accept="image/*" onChange={pickImage} />
                    {avatar && <img src={avatar} alt="Avatar" className="preview-img" />}
                </div>

                <div className="form-group">
                    <label htmlFor="stallDescription">Description</label>
                    <textarea
                        id="stallDescription"
                        name="stallDescription"
                        value={formValues.stallDescription}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="Stall Description"
                    />
                    {formErrors.stallDescription && <div className="error">{formErrors.stallDescription}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="stallAddress">Stall Address</label>
                    <input
                        type="text"
                        id="stallAddress"
                        name="stallAddress"
                        value={formValues.stallAddress}
                        onChange={handleInputChange}
                        placeholder="Stall Address"
                    />
                    {formErrors.stallAddress && <div className="error">{formErrors.stallAddress}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="stallNumber">Stall Number</label>
                    <input
                        type="text"
                        id="stallNumber"
                        name="stallNumber"
                        value={formValues.stallNumber}
                        onChange={handleInputChange}
                        placeholder="Stall Number"
                    />
                    {formErrors.stallNumber && <div className="error">{formErrors.stallNumber}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="stallHours">Stall Hours</label>
                    <input
                        type="text"
                        id="stallHours"
                        name="stallHours"
                        value={formValues.stallHours}
                        onChange={handleInputChange}
                        placeholder="Stall Hours"
                    />
                    {formErrors.stallHours && <div className="error">{formErrors.stallHours}</div>}
                </div>

                <button type="submit" className="submit-button">Add Stall</button>
            </form>
        </div>
    );
};

export default AddStall;

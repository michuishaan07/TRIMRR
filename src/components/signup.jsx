import React, { useEffect, useState } from 'react';
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "./ui/button";
import Error from "./error";
import { BeatLoader } from "react-spinners";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import useFetch from '../hooks/use-fetch';
import { signup } from "@/db/apiAuth"; // Ensure you have this import
import { UrlState } from '../context';

const Signup = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });
  const [loading, setLoading] = useState(false); // Define loading state

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const { data, error, loading: fetchLoading, fn: fnSignup } = useFetch(signup, formData);

  const { fetchUser } = UrlState();

  useEffect(() => {
    if (error === null && data) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
      fetchUser();
    }
  }, [data, error]);

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page
    setErrors({}); // Reset errors
    setLoading(true); // Set loading to true when login starts
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().required("Profile picture is required"),
      });

      await schema.validate(formData, { abortEarly: false });
      await fnSignup(); // Ensure this function is defined
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    } finally {
      setLoading(false); // Reset loading state after login process completes
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
        <CardDescription>Create a new account if you haven’t already</CardDescription>
        {error && <Error message={error?.message} />}
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="name"
              type="text"
              placeholder="Enter Name"
              onChange={handleInputChange}
            />
          </div>
          {errors.name && <Error message={errors.name} />}
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter Email"
              onChange={handleInputChange}
            />
          </div>
          {errors.email && <Error message={errors.email} />}
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter Password"
              onChange={handleInputChange}
            />
          </div>
          {errors.password && <Error message={errors.password} />}
          <div className="space-y-1">
            <input
              name="profile_pic"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>
          {errors.profile_pic && <Error message={errors.profile_pic} />}
        </CardContent>
        <CardFooter>
          <Button type="submit">
            {loading ? (
              <BeatLoader size={10} color="#36d7b7" />
            ) : (
              "Create Account"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Signup;

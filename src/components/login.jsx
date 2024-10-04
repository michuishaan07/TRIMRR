import React, { useEffect, useState } from 'react';
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "./ui/button";
import Error from "./error";
import { BeatLoader } from "react-spinners";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import useFetch from '../hooks/use-fetch';
import { login } from "@/db/apiAuth"; // Ensure you have this import
import { UrlState } from '../context';

const Login = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false); // Define loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  
  const { data, error, loading: fetchLoading, fn: fnLogin } = useFetch(login, formData);

const{fetchUser}=UrlState();


  useEffect(() => {
   if(error === null && data)
   {
    navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    fetchUser();
   }
  }, [data, error]);





  const handleLogin = async () => {
    setErrors({}); // Reset errors
    setLoading(true); // Set loading to true when login starts
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      });

      await schema.validate(formData, { abortEarly: false });
      await fnLogin(); // Ensure this function is defined
      // Optionally navigate to a different page on success
      // navigate('/somepath');
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
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>to your account if you already have one</CardDescription>
          {error && <Error message={error.message} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter Email"
              onChange={handleInputChange}
            />
            {errors.email && <Error message={errors.email} />}
          </div>
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter Password"
              onChange={handleInputChange}
            />
            {errors.password && <Error message={errors.password} />}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin}>
            {loading ? <BeatLoader size={10} color="#36d7b7" /> : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;

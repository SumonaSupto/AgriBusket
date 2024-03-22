import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateUserWithEmailAndPassword,
  useUpdateProfile,
} from "react-firebase-hooks/auth";
import auth from "../../../firebase.init";
import toast from "react-hot-toast";

const Regestration = () => {
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const [updateProfile, updating] = useUpdateProfile(auth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    await createUserWithEmailAndPassword(data.email, data.password);
    await updateProfile({ displayName: data.name });
  };
  console.log(user);

  if (user?.user?.accessToken) {
    toast.success("Congratulations!!! User created Successfully.");
    navigate("/");
  }

  return (
<div className="grid grid-cols-2 grid-rows-2 gap-20 ml-20 mt-10">
   <div>
    <img src="https://img.freepik.com/free-vector/medical-prescription-concept-illustration_114360-6755.jpg?t=st=1711086643~exp=1711090243~hmac=a77e76a8e26c80e4bfd823c79ef54edad5963e1b0914fc814985089b67fdb2a8&w=740" alt="registration" />

   </div>

   
    <div>
      <h1 className="font-semibold text-3xl mb-4 ">Register Here</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block">Name</label>
          <input
            className="input input-bordered input-accent w-full max-w-xs "
            defaultValue=""
            {...register("name")}
            placeholder="your name"
          />
        </div>
        <div className="mb-4">
          <label className="block">Phone</label>
          <input
            className="input input-bordered input-accent w-full max-w-xs "
            defaultValue=""
            {...register("phoneNumber")}
            placeholder="your phone number"
          />
        </div>

        <div className="mb-4">
          <label className="block">Email</label>
          <input
            className="input input-bordered input-accent w-full max-w-xs"
            {...register("email", { required: true })}
            placeholder="email"
          />
        </div>
        {errors.email && (
          <span className="text-red-600">Email is required</span>
        )}

        <div>
          <label className="block">Password</label>
          <input
            className="input input-bordered input-accent w-full max-w-xs"
            {...register("password", { required: true })}
            placeholder="password"
            type="password"
          />
        </div>
        {errors.password && (
          <span className="text-red-600">Password is required</span>
        )}

        {loading || updating ? (
         <span className="loading loading-spinner text-accent mt-5 mb-5"></span>
        ) : (
          <input
            className="btn btn-outline btn-accent mt-5 mb-5"
            type="submit"
          />
        )}
     <br />
        <Link to="/login" className="text-sky-500 mt-10">
          Already have an account? Login here
        </Link>

        {error && (
          <h1 className="text-red-700 text-center mt-6 text-2xl font-semibold">
            {error.message}
          </h1>
        )}
      </form>
    </div>
    </div>
  );
};

export default Regestration;
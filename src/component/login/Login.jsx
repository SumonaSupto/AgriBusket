import { useForm } from "react-hook-form";
import auth from "../../../firebase.init";
import { Link, useNavigate } from "react-router-dom";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";
const Login = () => {
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    signInWithEmailAndPassword(data.email, data.password);
  };
  console.log(user);

  if (user) {
    toast.success("Congratulations!! User Logged in successfully");
    navigate("/");
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-20 ml-20 mt-10">

      <div>
      <img src="https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7892.jpg?t=st=1711086596~exp=1711090196~hmac=8763a94c712b99ad49bec22df5052c6fc3f51fb30334d78454b761c605732b4c&w=740" alt="login" />
      </div>


    <div className="m-auto w-1/2 mt-10">
      <h1 className="font-semibold text-3xl text-center mb-4 ">Login Here</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block">Email</label>
          <input
            className="input input-bordered input-accent w-full max-w-xs "
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
            className="input input-bordered input-accent w-full max-w-xs "
            {...register("password", { required: true })}
            placeholder="password"
            type="password"
          />
        </div>
        {errors.password && (
          <span className="text-red-600">Password is required</span>
        )}
        {loading ? (
          <span className="loading loading-spinner text-accent mt-5 mb-5"></span>
        ) : (
          <input
            className="btn btn-outline btn-accent mt-5 mb-5"
            type="submit"
          />
        )}
      <br />
        <Link to="/regestration" className="text-sky-500 mt-10">
          Not an Account? Sign up here.
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

export default Login;
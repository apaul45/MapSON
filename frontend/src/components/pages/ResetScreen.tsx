import { useState } from 'react';
import { store } from '../../models';
import { useSearchParams } from 'react-router-dom';

export const ResetScreen = () => {
  const [pwd, setPwd] = useState('');
  const [repwd, setRepwd] = useState('');
  const { user, error } = store.dispatch;

  const [queryParameters] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (pwd !== repwd) {
      error.setError('Please make sure the passwords match');
      return;
    }
    const email = queryParameters.get('email');
    const key = queryParameters.get('key');
    const success = await user.resetPassword({
      email: email,
      recoverKey: key,
      password: pwd,
    });
    if (success) {
      alert('Password reset successfully');
    }
  };
  return (
    <div className="lr-bg">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <div className="text-white text-3xl mt-32">Enter the your new password</div>

        <form className="mt-16" onSubmit={(e) => handleSubmit(e)}>
          <div className="my-10">
            <input
              name="password"
              className="form-inputs"
              placeholder="Password"
              type="password"
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
          <div>
            <input
              name="repassword"
              className="form-inputs"
              placeholder="Re-neter Password"
              type="password"
              onChange={(e) => setRepwd(e.target.value)}
            />
          </div>
          <div className="mt-6">
            <input type="submit" value="Submit" className="lr-btn" />
          </div>
        </form>
      </div>
    </div>
  );
};

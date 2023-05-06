import { useState } from 'react';
import { store } from '../../models';

export const RecoveryScreen = () => {
  const [email, setEmail] = useState('');

  const { user, error } = store.dispatch;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (await user.recoverPassword({ email: email })) {
      error.setError('Email sent');
    }
  };

  return (
    <div className="lr-bg">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <div className="text-white text-3xl mt-32">
          Enter the email you used to register for the account below
        </div>

        <form className="mt-16" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <input
              name="email"
              className="form-inputs"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
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

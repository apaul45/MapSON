export const RecoveryScreen = () => {
  return (
    <div className="lr-bg">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <div className="text-white text-3xl mt-32">
          Enter the email you used to register for the account below
        </div>

        <form className="mt-16">
          <div>
            <input name="email" className="form-inputs" placeholder="Email" />
          </div>
          <div className="mt-6">
            <input type="submit" value="Submit" className="lr-btn" />
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from "react";
import { resetPassword } from "../services/api";

function ResetPassword() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleSubmit = async (e) => {

    e.preventDefault()

    try{
      await resetPassword({email,password})
      alert("Password updated")
    }
    catch(err){
      alert(err.message)
    }

  }

  return (
    <form onSubmit={handleSubmit}>

      <h2>Reset Password</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="New Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button>Reset Password</button>

    </form>
  )

}

export default ResetPassword
import { useState } from "react";
import { verifyOTP } from "../services/api";

function VerifyOTP() {

  const [email,setEmail] = useState("")
  const [otp,setOtp] = useState("")

  const handleSubmit = async (e) => {

    e.preventDefault()

    try{
      await verifyOTP({email,otp})
      alert("OTP verified")
    }
    catch(err){
      alert(err.message)
    }

  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />

      <input placeholder="OTP" onChange={(e)=>setOtp(e.target.value)} />

      <button>Verify</button>
    </form>
  )

}

export default VerifyOTP
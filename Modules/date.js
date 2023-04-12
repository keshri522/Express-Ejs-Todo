

const Today=()=>{
    let today=new Date();
    let options={
        weekday:"long",
        month:"long",
        day:"numeric"
    }
    const days=today.toLocaleDateString("en-us",options);
    return days;
}
module.exports.Today=Today;

// note here not define today() like this because in this.app.js we define that this is function when ever use simpy resue this
const HindiDate=()=>{
    const hindi=new Date();
    const options={
        weekday:"long",
        month:"long",
        day:"numeric"
    }
    const hindidate=hindi.toLocaleDateString("hi-IN",options)
    return hindidate;
}
module.exports.HindiDate=HindiDate;

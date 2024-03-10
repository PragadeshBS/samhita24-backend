const textOnly = (str) => {
  if (!str) {
    return "";
  }
  return str.replace(/[^a-zA-Z]/g, "").toLowerCase();
};

const validateReferral = (referral, user) => {
  if (!referral) {
    return {
      success: false,
      message: "Referral code not found",
    };
  }
  if (!referral.active) {
    return {
      success: false,
      message: "Referral code is not active",
    };
  }
  if (
    referral.applicableCollege &&
    textOnly(referral.applicableCollege) !== textOnly(user.college)
  ) {
    return {
      success: false,
      message: "Referral code is not applicable for your college",
    };
  }
  if (
    referral.applicableGender &&
    textOnly(referral.applicableGender) !== textOnly(user.gender)
  ) {
    return {
      success: false,
      message: `Referral code is not applicable for your gender`,
    };
  }
  if (
    referral.applicableDept &&
    textOnly(referral.applicableDept) !== textOnly(user.dept)
  ) {
    return {
      success: false,
      message: `Referral code is not applicable for your department`,
    };
  }
  return { success: true };
};

const validateReferralForTransaction = (
  referral,
  user,
  checkoutIds,
  ticketTypes
) => {
  const basicValidation = validateReferral(referral, user);
  if (!basicValidation.success) {
    return basicValidation;
  }
  if (
    referral.applicableCheckoutIds &&
    referral.applicableCheckoutIds.length > 0 &&
    !checkoutIds.every((id) => referral.applicableCheckoutIds.includes(id))
  ) {
    return {
      success: false,
      message: "Referral code is not applicable for your selected tickets",
    };
  }
  if (
    referral.applicableTicketTypes &&
    referral.applicableTicketTypes.length > 0 &&
    !ticketTypes.every((type) => referral.applicableTicketTypes.includes(type))
  ) {
    return {
      success: false,
      message: "Referral code is not applicable for your selected tickets",
    };
  }
  return { success: true };
};

module.exports = {
  validateReferral,
  validateReferralForTransaction,
};

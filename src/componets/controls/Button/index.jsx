import "./index.scss";

export const Button = ({ type, children, disabled, onClick }) => {
  return (
    <button
      type={type}
      className="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

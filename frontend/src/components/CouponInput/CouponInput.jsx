import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiTag, FiX } from 'react-icons/fi';
import { couponService } from '../../services/marketingService';
import './CouponInput.css';

/** Applies / removes a coupon. Calls onApply(couponObject|null). */
const CouponInput = ({ subtotal, applied, onApply }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const apply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const coupon = await couponService.validate(code, subtotal);
      onApply(coupon);
      toast.success(`Coupon ${coupon.code} applied!`);
      setCode('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="coupon coupon--applied">
        <FiTag /> <strong>{applied.code}</strong> applied
        <button type="button" onClick={() => onApply(null)} aria-label="Remove coupon">
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <form className="coupon" onSubmit={apply}>
      <label htmlFor="coupon" className="sr-only">Coupon code</label>
      <input id="coupon" className="input" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      <button className="btn btn-light btn-sm" type="submit" disabled={loading}>
        {loading ? '...' : 'Apply'}
      </button>
    </form>
  );
};

export default CouponInput;

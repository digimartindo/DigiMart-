import { RentalHistoryItem } from '../types';
import { formatRupiah, formatDuration, formatDateTime } from '../utils/formatters';

interface PrintableReceiptProps {
  receipt: RentalHistoryItem | null;
  loyaltyStamps?: number;
}

export default function PrintableReceipt({ receipt, loyaltyStamps = 1 }: PrintableReceiptProps) {
  if (!receipt) return null;

  return (
    <div
      id="printable-receipt"
      className="hidden print:block text-black bg-white p-2 font-mono text-[11px] leading-tight"
      style={{ width: '58mm', margin: '0 auto' }}
    >
      {/* Header */}
      <div className="text-center pb-2">
        <div className="text-base font-black tracking-wider uppercase">PLUS+GAME</div>
        <div className="text-[9px]">PlayStation Lounge & Cafe</div>
        <div className="text-[9px]">Jl. Game Center No. 88</div>
        <div className="text-[8px] text-zinc-600 mt-0.5">IG: @plusgame.id</div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Meta Info */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>No. Nota:</span>
          <span className="font-bold">#{String(receipt.id).slice(-6)}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{formatDateTime(receipt.endTime)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span className="truncate max-w-[100px]">{receipt.cashierEmail?.split('@')[0] || 'Admin'}</span>
        </div>
        <div className="flex justify-between">
          <span>Gamer:</span>
          <span className="font-bold truncate max-w-[100px]">{receipt.customerName}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Rental Details */}
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between font-bold">
          <span>{receipt.consoleName}</span>
          <span>{formatRupiah(receipt.rentalCost)}</span>
        </div>
        <div className="text-[9px] text-zinc-700 pl-2">
          Durasi: {formatDuration(receipt.duration)} ({receipt.rentalType === 'paket' ? `Paket ${receipt.packageCount} Jam` : 'Open Time'})
        </div>

        {/* F&B Items */}
        {receipt.fnbItems && receipt.fnbItems.length > 0 && (
          <div className="pt-1 space-y-1">
            <div className="text-[9px] font-bold">Pesanan F&B:</div>
            {receipt.fnbItems.map((f, idx) => (
              <div key={idx} className="flex justify-between pl-2 text-[9px]">
                <span className="truncate max-w-[110px]">
                  {f.name} x{f.quantity}
                </span>
                <span>{formatRupiah(f.price * f.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Financial Summary */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal Rental:</span>
          <span>{formatRupiah(receipt.rentalCost)}</span>
        </div>
        {receipt.fnbCost > 0 && (
          <div className="flex justify-between">
            <span>Subtotal F&B:</span>
            <span>{formatRupiah(receipt.fnbCost)}</span>
          </div>
        )}
        {receipt.discount > 0 && (
          <div className="flex justify-between font-bold">
            <span>Diskon ({receipt.discountNote || 'Promo'}):</span>
            <span>-{formatRupiah(receipt.discount)}</span>
          </div>
        )}
        <div className="border-t border-dotted border-black my-1" />
        <div className="flex justify-between text-xs font-black">
          <span>TOTAL BAYAR:</span>
          <span>{formatRupiah(receipt.cost)}</span>
        </div>
        <div className="flex justify-between text-[9px] pt-0.5">
          <span>Metode:</span>
          <span className="uppercase font-bold">{receipt.paymentMethod}</span>
        </div>
        {receipt.cashGiven && (
          <>
            <div className="flex justify-between text-[9px]">
              <span>Tunai:</span>
              <span>{formatRupiah(receipt.cashGiven)}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span>Kembalian:</span>
              <span>{formatRupiah(receipt.change || 0)}</span>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Loyalty Stamp Section */}
      <div className="text-center py-1">
        <div className="text-[9px] font-bold">KARTU STAMP MEMBER</div>
        <div className="text-[10px] tracking-widest my-0.5">
          {Array.from({ length: 10 }).map((_, i) => (i < loyaltyStamps ? '★ ' : '☆ ')).join('')}
        </div>
        <div className="text-[8px]">
          Terkumpul: {loyaltyStamps}/10 Stamp (10 = Gratis 1 Jam!)
        </div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Footer message */}
      <div className="text-center text-[9px] space-y-0.5 pt-1">
        <div className="font-bold">TERIMA KASIH! GGWP!</div>
        <div className="text-[8px]">Simpan struk ini sebagai bukti resmi.</div>
        <div className="text-[8px]">Mabar seru berikutnya di Plus+Game!</div>
      </div>
    </div>
  );
}

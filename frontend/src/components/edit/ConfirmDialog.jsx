import Modal from "@/components/edit/Modal";

// ConfirmDialog 删除等危险操作的确认弹窗
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="确认操作" onClose={onCancel}>
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600 cursor-pointer"
        >
          删除
        </button>
      </div>
    </Modal>
  );
}

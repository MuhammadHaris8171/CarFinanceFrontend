export default function FilePreview({ label, fileUrl }) {
  if (!fileUrl) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileUrl);
  const isPDF = /\.pdf$/i.test(fileUrl);

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">{label}</h3>
      {isImage ? (
        <img
          src={fileUrl}
          alt={label}
          className="max-w-xs border rounded shadow-sm"
        />
      ) : isPDF ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View PDF
        </a>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View File
        </a>
      )}
    </div>
  );
}

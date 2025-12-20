"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  Video,
  File,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClientDrawingsPage() {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    setLoading(true);
    const token = sessionStorage.getItem("token");
    if (!token) return setEmpty();

    try {
      const res = await fetch("/api/clients/drawings", {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDrawings(data?.drawings || []);
    } catch {
      setEmpty();
    }
    setLoading(false);
  };

  const setEmpty = () => {
    setDrawings([]);
    setLoading(false);
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isVideo = (url) => /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(url);
  const isPdf = (url) => /\.pdf$/i.test(url);

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="text-red-600 w-5 h-5" />;
    if (["doc", "docx"].includes(ext))
      return <FileText className="text-blue-600 w-5 h-5" />;
    if (["xls", "xlsx"].includes(ext))
      return <FileText className="text-green-600 w-5 h-5" />;
    return <File className="text-gray-600 w-5 h-5" />;
  };

  const openPreview = (drawing) => {
    const related = drawings.filter(
      (d) => d.projectId === drawing.projectId
    );
    const index = related.findIndex((d) => d.id === drawing.id);

    setProjectFiles(related);
    setCurrentIndex(index);
    setSelectedDrawing(drawing);
    setPreviewFile(drawing.fileUrl);
  };

  const nextFile = () => {
    if (!projectFiles.length) return;
    const nextIndex = (currentIndex + 1) % projectFiles.length;
    const next = projectFiles[nextIndex];
    setCurrentIndex(nextIndex);
    setSelectedDrawing(next);
    setPreviewFile(next.fileUrl);
  };

  const prevFile = () => {
    if (!projectFiles.length) return;
    const prevIndex =
      currentIndex === 0 ? projectFiles.length - 1 : currentIndex - 1;
    const prev = projectFiles[prevIndex];
    setCurrentIndex(prevIndex);
    setSelectedDrawing(prev);
    setPreviewFile(prev.fileUrl);
  };

  const downloadFile = async () => {
    if (!previewFile || !selectedDrawing) return;
    const res = await fetch(previewFile);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedDrawing.title}`.replace(/\s+/g, "_");
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Project Drawings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Drawings Assigned</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawings.length ? (
                  drawings.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.project?.title}</TableCell>
                      <TableCell>
                        {d.project?.contractor?.name || "-"}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getFileIcon(d.title)}
                        {d.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPreview(d)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500 py-8"
                    >
                      No drawings uploaded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {previewFile && (
        <Dialog open onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>{selectedDrawing?.title}</DialogTitle>
              <p className="text-sm text-gray-500">
                {selectedDrawing?.project?.title}
              </p>
            </DialogHeader>

            {/* PREVIEW */}
            <div className="max-h-[70vh] overflow-hidden">
              {isImage(previewFile) && (
                <img
                  src={previewFile}
                  className="mx-auto max-h-[65vh]"
                />
              )}

              {isVideo(previewFile) && (
                <video
                  controls
                  className="mx-auto max-h-[65vh]"
                  src={previewFile}
                />
              )}

              {!isImage(previewFile) && !isVideo(previewFile) && (
                <iframe
                  src={
                    isPdf(previewFile)
                      ? previewFile
                      : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                          previewFile
                        )}`
                  }
                  className="w-full h-[65vh]"
                />
              )}
            </div>

            {/* ACTION BAR */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevFile}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={nextFile}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-2">
                <a
                  href={previewFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  View in New Tab
                </a>
                <button
                  onClick={downloadFile}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Download
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

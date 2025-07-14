"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ImageIcon, CheckCircle } from "lucide-react"

export default function BackgroundImageUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setUploadSuccess(false) // Reset success state on new file selection
    } else {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Пожалуйста, выберите изображение для загрузки.")
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    // Simulate upload to Supabase Storage
    // In a real application, you would upload the file to Supabase Storage here.
    // Example:
    // const { data, error } = await supabase.storage.from('background-images').upload(`homepage-bg-${Date.now()}.jpg`, selectedFile);
    // if (error) {
    //   console.error('Error uploading image:', error);
    //   alert('Ошибка загрузки изображения.');
    // } else {
    //   const publicUrl = supabase.storage.from('background-images').getPublicUrl(data.path).data.publicUrl;
    //   console.log('Image uploaded successfully:', publicUrl);
    //   // Here you would save `publicUrl` to your database (e.g., a 'settings' table)
    //   // and then trigger a re-render or revalidation on the homepage.
    //   alert('Изображение успешно загружено и установлено как фон!');
    //   setUploadSuccess(true);
    // }

    // For demo purposes, just simulate a delay and success
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Simulated upload of:", selectedFile.name)
    alert("Изображение успешно загружено и установлено как фон (демо-режим)!")
    setUploadSuccess(true)
    setUploading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-orange-500" />
          Заменить фоновое изображение
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="background-image-upload">Выберите файл изображения</Label>
          <Input
            id="background-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-orange-500 file:font-semibold"
          />
          <p className="text-sm text-gray-500">Поддерживаются форматы: JPG, PNG, WebP. Макс. размер 5МБ.</p>
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <Label>Предварительный просмотр</Label>
            <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Предварительный просмотр"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || uploadSuccess}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {uploading ? (
            "Загрузка..."
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" /> Успешно!
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Загрузить и установить
            </>
          )}
        </Button>

        {uploadSuccess && (
          <p className="text-sm text-green-600 text-center">
            Изображение успешно загружено. В реальном приложении оно будет сохранено в базе данных и применено к главной
            странице.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

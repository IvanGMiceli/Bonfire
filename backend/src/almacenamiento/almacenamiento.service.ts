import { BadRequestException, Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class AlmacenamientoService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }

  async subirImagen(archivo: Express.Multer.File, bucket: string) {
    const extension = archivo.originalname.split('.').pop();
    const nombreArchivo = `${randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(nombreArchivo, archivo.buffer, { contentType: archivo.mimetype });

    if (error) {
      throw new BadRequestException('No se pudo subir la imagen');
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(nombreArchivo);
    return data.publicUrl;
  }
}
